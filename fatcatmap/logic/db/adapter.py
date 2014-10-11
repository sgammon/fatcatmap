# -*- coding: utf-8 -*-

'''

  fcm: db adapter

'''

# stdlib
import abc
import json
import base64
import datetime
import operator
import itertools

# redis
try:
  import redis
except:
  redis = False

# msgpack
try:
  import msgpack
except:
  msgpack = False

# snappy
try:
  import snappy
except:
  snappy = False

# canteen
from canteen import model
from canteen import decorators
from canteen.model import adapter
from canteen.model.adapter import redis
from canteen.model.adapter import abstract
from canteen.model.adapter import inmemory


class WarehouseAdapter(abstract.DirectedGraphAdapter):

  ''' Specifies an abstract adapter that is capable of supporting proprietary,
      ``fatcatmap``-related driver functionality. '''

  # magic prefixes
  _key_prefix = '__key__'
  _kind_prefix = '__kind__'
  _group_prefix = '__group__'
  _index_prefix = '__index__'
  _reverse_prefix = '__reverse__'

  # graph/vertex/edge prefixes
  _edge_prefix = '__edge__'
  _graph_prefix = '__graph__'
  _vertex_prefix = '__vertex__'

  # extra prefixes
  _topic_prefix = '__topic__'
  _topics_prefix = '__topics__'
  _abstract_prefix = '__abstract__'
  _descriptor_postfix = '__descriptor__'

  # universal tokens
  _neighbors_token = 'neighbors'

  # directed tokens
  _in_token = 'in'
  _out_token = 'out'
  _directed_token = 'directed'

  # undirected tokens
  _peers_token = 'peers'
  _undirected_token = 'undirected'

  # extra tokens
  _type_token = 'type'
  _types_token = 'types'
  _relationship_token = 'relationship'


  ## +=+=+ Internal Methods +=+=+ ##
  @classmethod
  def _hints(subject, **kwargs):

    ''' Internal method that dispatches matching implementation ``hints`` on
        child classes. '''

  @classmethod
  def _descriptors(cls, subject, type=None, **kwargs):

    ''' Internal method that dispatches matching implementation ``descriptors``
        on child classes. '''

  ## +=+=+ Overridden Methods +=+=+ ##
  def _put(self, entity, **kwargs):

    ''' Override low-level storage logic for regular entities to add extra
        validation/rich property functionality. In particular:

          - expand created/modified fields
          - send blobs to external storage
          - descriptor storage (coming soon)

        :param entity: Entity to store using this adapter.
        :param kwargs: Keyword arguments to pass to underlying implementations.
        
        :returns: Result of internal adapter ``_put``. '''

    from fatcatmap import models
    model = entity.__class__

    if issubclass(model, models.BaseModel):
      desc = model.__description__

      # perform proprietary validation
      with entity:
        updates = {}  # updates to apply

        # only process `BaseModel` subclasses
        for prop, val in ((model.__dict__[name], val) for name, val in entity):
          # enforce property-level validators
          if 'validate' in prop._options:
            value = updates[prop.name] = prop._options['validate'](val)

        # apply updates
        if updates and len(entity):  # entity must have some properties
          entity.update(updates)

    # customize storage for descriptors
    if hasattr(entity, '__description__') and entity.__description__.descriptor:
      if entity.key and entity.key.parent:  # it's a descriptor
        return self.put_descriptor(entity, **kwargs)

    return super(WarehouseAdapter, self)._put(entity, **kwargs)

  @classmethod
  def get(cls, key, pipeline=None, _entity=None):

    ''' Override low-level storage logic for regular entities to
        retrieve certain FCM structures via specialized means.

        :param key: Target :py:class:`model.Key` to retrieve from storage.

        :param pipeline: Redis pipeline to enqueue the resulting commands
          in, rather than directly executing them. Defaults to ``None``. If a
          pipeline is passed, it will be returned in lieu of the pending
          result.

        :param _entity: Entity to inflate, if we already have one.

        :returns: The deserialized and decompressed entity associated with the
          target ``key``. '''

    if not _entity:  # go directly to deserialization

      encoded, flattened = key
      fullkey = model.Key.from_urlsafe(encoded)

      if fullkey.kind in cls.registry:
        _model = cls.registry[fullkey.kind]

        if hasattr(_model, '__description__') and (
          _model.__description__.descriptor):

          # it's a descriptor, retrieve it
          subject, keypath = fullkey.parent, fullkey.id

          result = cls.execute(*(
            cls.Operations.HASH_GET,
            _model.kind(),
            '::'.join((subject.urlsafe(), cls._descriptor_postfix)),
            keypath))

          if result:
            # leverage supermethod for deserialization
            return super(WarehouseAdapter, cls).get(None, None, result)
          return result
    return super(WarehouseAdapter, cls).get(key, pipeline, _entity)

  def put_descriptor(self, entity, **kwargs):

    ''' Add extra functionality to adapter ``put`` calls for FCM descriptor
        structures, which are stored parallel to their subjects in their
        own hash, where keys are dotted-path keys that represent their
        value.

        :param entity: Target :py:class:`fatcatmap.models.BaseModel` instance
          (marked as a descriptor) to be stored.

        :returns: Same value as if the target ``entity`` was stored via
          regular circumstances, i.e. a ``Key`` instance that has been marked
          as ``persisted``. '''

    assert entity.key.parent, (
      "descriptors must have parent keys")

    # calculate key path and slicing
    subject, keypath = entity.key.parent, entity.key.id

    # clean types @TODO(sgammon): this is gross
    serialized = entity if isinstance(entity, dict) else (
      entity.to_dict(convert_datetime=False,
                     convert_keys=True,
                     convert_models=True))

    _cleaned = {}
    for k, v in serialized.iteritems():
      prop = getattr(entity.__class__, k)
      if isinstance(v, (datetime.date, datetime.time, datetime.datetime)):
        _cleaned[k] = v.isoformat()  # pragma: no cover
      else:
        _cleaned[k] = v

    # serialize, also descriptors are never compressed
    serialized = self.serializer.dumps(_cleaned)

    # generate indexes because descriptors always have predictable paths
    d_encoded, d_meta, d_prop, d_graph = self.generate_indexes(*(
      entity.key, entity, self._pluck_indexed(entity)))

    # allocate a channel and store descriptor
    with (kwargs.get('pipeline') or (
      self.channel('__meta__').pipeline(transaction=False))) as pipe:

      self.execute(*(
        self.Operations.HASH_SET,
        entity.__class__,
        '::'.join((subject.urlsafe(), self._descriptor_postfix)),
        keypath,
        serialized), target=pipe)

      self.write_indexes((d_encoded, d_meta, d_prop), d_graph, pipeline=pipe, execute=True)

      pipe.execute()

    entity._set_persisted(True)
    return entity.key

  @classmethod
  def generate_indexes(cls, key, entity=None, properties=None):

    ''' Add extra functionality to indexing calls for certain FCM structures,
        for instance:

          - ask the entity for extra indexes
          - apply indexes for topics in freebase
          - apply 2nd-level graph indexes to key root
          - index against abstract types bound to model class
          - marking indexes to send search services

        :param key: :py:class:`canteen.model.Key` for the entity we're generating
          indexes for.

        :param entity: Full :py:class:`canteen.model.Model` instance that we are
          generating indexes for.

        :param properties: Properties selected for indexing storage by the builtin
          ``_pluck_indexes`` method. ``dict``.

        :returns: Result of internal adapter ``generate_indexes``, appended with
          proprietary catnip indexes. '''

    from fatcatmap import models

    supergen = super(WarehouseAdapter, cls).generate_indexes
    external = []

    if key and properties is None:
      # @TODO(sgammon): support cleaning proprietary indexes
      return supergen(key)

    if key:

      # fcm-based extensions
      if hasattr(entity, '__description__'):

        _model, description = cls.registry[entity.kind()], entity.__description__

        ## 1) yield upwards to generate meta/graph/property indexes
        encoded, meta, properties, graph = supergen(key, entity, properties)
        graph = list(graph)

        # @TODO(sgammon): double-level edge/neighbor indexes

        ## 2) generate graph indexes
        if hasattr(_model, '__graph__') or (
          issubclass(_model, model.Vertex) or (
          issubclass(_model, model.Edge))):

          cls.generate_graph_indexes(*(
            key, entity, meta, properties, graph))

        ## 3) generate abstract indexes
        cls.generate_abstract_indexes(*(
            key, entity, meta, properties, graph))

        # apply freebase topic indexes
        if description.topic:

          # topics + topic indexes
          meta.append((cls._topics_prefix, description.topic))
          meta.append((cls._topic_prefix, base64.b64encode(description.topic)))

        return (encoded,
                set(meta),
                set(properties),
                set(graph))

    return supergen(key, entity, properties)

  @classmethod
  def generate_graph_indexes(cls, key, entity, meta, properties, graph):

    '''  '''

    from fatcatmap.logic.graph import get_peers

    if hasattr(entity, '__graph__'):

      # add edge indexes
      if hasattr(entity, '__edge__'):

        # add relationship index
        relationship = reduce(operator.add, sorted((k.urlsafe().replace('=', '') for k in get_peers(entity))))
        graph.append((
          cls._graph_prefix,
          "::".join((reduce(operator.add, relationship), cls._relationship_token))))

      # add vertex indexes
      elif hasattr(entity, '__vertex__'):
        pass  # no extra vertex indexes yet

      else:
        raise RuntimeError('Invalid entity dispatched for graph'
                           ' index generation: "%s".' % repr(entity))

  @classmethod
  def generate_abstract_indexes(cls, key, entity, meta, properties, graph):

    '''  '''

    from canteen import model as model_api
    model, description = entity.__class__, entity.__description__

    ## roll-up hierarchy of type abstraction
    def types(target):

      ''' Walk the ``target`` :py:class:`models.BaseModel` abstract type tree,
          iterating all the way up to the root. '''

      desc = target.__description__

      for supertype in (desc.type or tuple()):
        for _inner_supertype in types(supertype):
          yield _inner_supertype
        yield supertype
      else:
        yield target

    ## prepare typestack for later, along with key root
    typestack = [_t for _t in types(model)]
    keyroot = (_k for _k in key.ancestry).next()

    considered, abstract_fcm, prop_fcm, graph_fcm, external = set(), [], [], [], []

    for supertype in typestack:

      # skip conditions
      if supertype in considered: continue
      considered.add(supertype)

      # if re-indexing is enabled, append indexes
      if supertype.__description__.reindex:
        
        # `__abstract__::Type` => target
        abstract_fcm.append((cls._abstract_prefix, (cls._types_token,), supertype.kind()))

        if keyroot != key:
          # `__abstract__::Type::<root>` => target
          abstract_fcm.append((cls._abstract_prefix, (cls._type_token, supertype.kind(),), keyroot.urlsafe()))

      for name, prop in ((i, getattr(model, i)) for i in model.__lookup__):
        if prop.indexed and prop.options.get('embedded'):
          subindexes = cls._pluck_indexed(getattr(entity, prop.name))

          if subindexes:

            # @TODO(sgammon): WHAT THE FUCK IS THIS SHIT, FUTURE SAM???

            # build kinded key to index against temporarily
            subkey = prop.basetype.__keyclass__(prop.basetype.kind())
            _, __, subprop, subgraph = cls.generate_indexes(subkey, getattr(entity, prop.name), subindexes)
            _, submeta, __, subgraph = cls.generate_indexes(key, getattr(entity, prop.name), subindexes)

            meta += submeta
            prop_fcm += subprop
            graph_fcm += subgraph

      # ask entity for extra indexes
      if hasattr(supertype, 'on_index'):
        for extra in supertype.on_index(entity, standard=(tuple(meta), tuple(properties), tuple(graph)),
                                              proprietary=(tuple(abstract_fcm), tuple(prop_fcm), tuple(graph_fcm)),
                                              external=external):

          # @TODO(sgammon): floats/ints/longs/sorted types
          if not isinstance(extra[-1], (long, int, float)):
            encoder = cls._index_basetypes.get(extra[-1].__class__, cls.serializer.dumps)
          else:
            encoder = type(extra[-1])

          if extra[0] == cls._index_prefix:
            prop_fcm.append((encoder, extra))
          elif extra[0] == cls._graph_prefix:
            graph_fcm.append((encoder, extra))
          elif extra[0] in frozenset((cls._key_prefix, cls._kind_prefix, cls._group_prefix)):
            meta.append((encoder, extra))
          else:
            raise RuntimeError('Model `on_index` event provided invalid index bundle: "%s".' % extra)

      if prop_fcm: properties += prop_fcm
      if graph_fcm: graph += graph_fcm
      if abstract_fcm: meta += abstract_fcm

  @classmethod
  def write_indexes(cls, writes, graph, **kwargs):

    ''' Override index write functionality to commit external indexes upon
        internal index commit.

        :param writes: Indexes to write the target key to, as a tuple of the items
          ``(meta, properties)``.

        :param graph: Writes to apply to graph indexes.

        :param kwargs: Keyword arguments to pass to the underlying implementation.

        :returns: Result of internal call to ``write_indexes``. '''

    return super(WarehouseAdapter, cls).write_indexes(writes, graph, **kwargs)

  ## +=+=+ Abstract Methods +=+=+ ##
  @abc.abstractmethod
  def hint(self, subject, data=None, **kwargs):  # pragma: no cover

    ''' Specifies an abstract interface for retrieving or writing graph ``Hint``
        objects, which accelerate queries by summarizing various traversed Graph
        fragments. '''

    raise NotImplemented('`hint` is abstract.')

  @abc.abstractmethod
  def descriptors(self, subject, type=None, **kwargs):  # pragma: no cover

    ''' Specifies an abstract interface for retrieving an object's
        ``Descriptor``s, which are tiny decorator objects attached to parent
        objects to specify extra data or metadata. '''

    raise NotImplemented('`descriptors` is abstract.')


class InMemoryWarehouse(WarehouseAdapter, inmemory.InMemoryAdapter):

  ''' In-memory implementation of the fcm-proprietary abstract
      ``WarehouseAdapter``. Mostly used for testing against a simple,
      known-good API. '''

  is_supported = classmethod(lambda cls: True)  # always supported

  ## +=+=+ Graph Methods +=+=+ ##
  def edges(self, key1, key2=None, type=None, **kwargs):

    ''' Retrieve edges for ``key1``, or between ``key1`` and ``key2``,
        optionally filtered by ``type``, from memory. '''

    raise NotImplemented('`memory` graph support not yet implemented.')

  def neighbors(self, key, type=None, **kwargs):

    ''' Retrieve neighbor nodes, which are peers across ``edges``, for ``key``,
        optionally filtered by ``type``, from memory. '''

    raise NotImplemented('`memory` graph support not yet implemented.')

  ## +=+=+ Proprietary Methods +=+=+ ##
  def native(self, subject, version=None, **kwargs):

    ''' Retrieve an object's ``Native``, which contains implmentation data for a
        given ``subject`` key, optionally by ``version``, from memory. '''

    raise NotImplemented('`memory` graph support not yet implemented.')

  def attach(self, subject, descriptor, **kwargs):

    ''' Attach a new ``descriptor`` object to a ``subject`` key, which contains
        extra ancillary data, in memory. '''

    raise NotImplemented('`memory` graph support is not yet implemented.')

  def descriptors(self, subject, type=None, **kwargs):

    ''' Retrieve attached ``Descriptor`` objects for a given ``subject`` key,
        optionally filtered by ``type``, from memory. '''

    raise NotImplemented('`memory` graph support not yet implemented.')

  def hint(self, subject, data=None, **kwargs):

    ''' Retrieve graph ``Hint`` objects for a given ``subject`` key, or store a
        ``Hint`` if ``data`` is provided, in memory. '''

    raise NotImplemented('`memory` graph support not yet implemented.')


class DatastoreWarehouse(WarehouseAdapter):

  ''' Google Cloud Datastore-based implementation of the abstract
      ``WarehouseAdapter``. '''

  # disabled, for now (@TODO(sgammon))
  is_supported = classmethod(lambda cls: False)

  ## +=+=+ Graph Methods +=+=+ ##
  def edges(self, key1, key2=None, type=None, **kwargs):

    ''' Retrieve edges for ``key1``, or between ``key1`` and ``key2``,
        optionally filtered by ``type``, from the Datastore. '''

    raise NotImplemented('`Datastore` graph support not yet implemented.')

  def neighbors(self, key, type=None, **kwargs):

    ''' Retrieve neighbor nodes, which are peers across ``edges``, for ``key``,
        optionally filtered by ``type``, from the Datastore. '''

    raise NotImplemented('`Datastore` graph support not yet implemented.')

  ## +=+=+ Proprietary Methods +=+=+ ##
  def native(self, subject, version=None, **kwargs):

    ''' Retrieve an object's ``Native``, which contains implmentation data for a
        given ``subject`` key, optionally by ``version``, from the
        Datastore. '''

    raise NotImplemented('`Datastore` graph support not yet implemented.')

  def attach(self, subject, descriptor, **kwargs):

    ''' Attach a new ``descriptor`` object to a ``subject`` key, which contains
        extra ancillary data, in the Datastore. '''

    raise NotImplemented('`Datastore` graph support is not yet implemented.')

  def descriptors(self, subject, type=None, **kwargs):

    ''' Retrieve attached ``Descriptor`` objects for a given ``subject`` key,
        optionally filtered by ``type``, from the Datastore. '''

    raise NotImplemented('`Datastore` graph support not yet implemented.')

  def hint(self, subject, data=None, **kwargs):

    ''' Retrieve graph ``Hint`` objects for a given ``subject`` key, or store a
        ``Hint`` if ``data`` is provided, in the Datastore. '''

    raise NotImplemented('`Datastore` graph support not yet implemented.')

  def connect(cls, key1, key2, edge, **kwargs):

    ''' Connect two objects (expressed as ``key1`` and ``key2``) as ``Vertexes``
        by an ``Edge`` in the Datastore. '''

    raise NotImplemented('`Datastore` graph support not yet implemented.')


class RedisWarehouse(WarehouseAdapter, redis.RedisAdapter):

  ''' Redis-backed implementation of the fcm-proprietary abstract
      ``WarehouseAdapter``. Powered by Canteen's builtin Redis driver. '''

  is_supported = classmethod(lambda cls: redis)

  class EngineConfig(redis.RedisAdapter.EngineConfig):

    ''' Configuration for the `RedisWarehouse` engine. '''

    serializer = msgpack
    compression = snappy
    mode = redis.RedisMode.hashkey_blob

  @decorators.classproperty
  def config(self):

    ''' Return adapter config. '''

    from fatcatmap import config
    return config.config['RedisWarehouse']

  ## +=+=+ Basic Methods +=+=+ ##
  @classmethod
  def put(cls, key, entity, model, pipeline=None):

    ''' Persist an entity to storage in the Redis Warehouse.

        :param key: New (and potentially empty) :py:class:`model.Key` for
          ``entity``. Must be assigned an ``ID`` by the driver through
          :py:meth:`RedisAdapter.allocate_ids` in the case of an empty
          (non-deterministic) :py:class:`model.Key`.

        :param entity: Object entity :py:class:`model.Model` to persist in
          ``Redis``.

        :param model: Schema :py:class:`model.Model` associated with the
          target ``entity`` being persisted.

        :returns: Result of the lower-level write operation. '''

    return super(RedisWarehouse, cls).put(key, entity, model, pipeline)

  ## +=+=+ Graph Methods +=+=+ ##
  def edges(self, key1, key2=None, type=None, **kwargs):

    ''' Retrieve edges for ``key1``, or between ``key1`` and ``key2``,
        optionally filtered by ``type``, from Redis. '''

    raise NotImplemented('`Redis` graph support'
                         ' not yet implemented.')  # pragma: no cover

  def neighbors(self, key, execute=True, **kwargs):

    ''' Retrieve neighbor nodes, which are peers across ``edges``, for ``key``,
        from Redis. '''

    from fatcatmap import models

    _q = models.Vertex(key=key).neighbors(**kwargs)
    return _q.fetch() if execute else _q

  ## +=+=+ Proprietary Methods +=+=+ ##
  def descriptors(self, subject, type=None, **kwargs):

    ''' Retrieve attached ``Descriptor`` objects for a given ``subject`` key,
        optionally filtered by ``type``, from Redis. '''

    raise NotImplemented('`Redis` graph support'
                         ' not yet implemented.')  # pragma: no cover

  def hint(self, subject, data=None, **kwargs):

    ''' Retrieve graph ``Hint`` objects for a given ``subject`` key, or store a
        ``Hint`` if ``data`` is provided, in Redis. '''

    raise NotImplemented('`Redis` graph support'
                         ' not yet implemented.')  # pragma: no cover


# install adapters
adapter.concrete += [InMemoryWarehouse,
                     DatastoreWarehouse,
                     RedisWarehouse]
