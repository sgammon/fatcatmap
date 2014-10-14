# -*- coding: utf-8 -*-

'''

  fcm: db adapter

'''

# stdlib
import os
import sys
import abc
import time
import json
import base64
import hashlib
import datetime
import operator
import itertools
import threading

# catnip dependencies
import redis
import msgpack

# redis exceptions
from redis import exceptions as wire_errors

# snappy
try:
  import snappy
except:
  snappy = False

# fcm config
from fatcatmap import config

# canteen
from canteen import model
from canteen import decorators
from canteen.model import adapter
from canteen.model.adapter import redis
from canteen.model.adapter import abstract
from canteen.model.adapter import inmemory


## Globals
get_peers = lambda x: x.peers if hasattr(x, 'peers') else (x.source, x.target[0])


def load_script(script):

  ''' Read a Lua script file so that it can be loaded into Redis
      for later use via ``EVALSHA``.

      :param script: Path to the script to load, relative to the
        application's configured DB scripts path.

      :returns: Content of the ``script`` in question, with
        newlines replaced as ``\n``, and any ``require``d
        dependencies inlined. '''

  buf = []
  with open(script, 'r') as scriptfile:
    ignore = False

    for line in scriptfile:

      # handle ignore flag for multiline comments
      if '[[' in line or ']]' in line:
        ignore = True
        if ']]' in line: ignore = False
        if __debug__: buf.append(r' ')
        continue

      # respect ignored lines
      if ignore:
        if __debug__: buf.append(r' ')
        continue

      lineval = line.strip()

      # skip comments in prod
      if __debug__ and lineval.startswith('--'): continue

      # handle loading dependencies manually
      if 'require' in lineval:
        statement = lineval.split(' ')[1].replace('"', '').replace("'", '').replace(';', '')
        name, (sha1, block) = load_script(os.path.join(os.path.dirname(script), statement))

        buf.append(block)
        continue

      buf.append(line.strip() + '\n')

  content = ' '.join(buf)
  return (script.split('/')[-1].split('.')[0], (hashlib.sha1(content).hexdigest(), content))


class WarehouseAdapter(abstract.DirectedGraphAdapter):

  ''' Specifies an abstract adapter that is capable of supporting proprietary,
      ``fatcatmap``-related driver functionality.

      In particular, ``WarehouseAdapter``-compliant adapters support:
        - Efficient graph traversal
        - Efficient storage of object metadata
        - Custom abstract indexes
        - Custom database scripting '''

  # undirected tokens
  _peers_token, _undirected_token = (
    'peers', 'undirected')

  # directed tokens
  _in_token, _out_token, _directed_token = (
    'in', 'out', 'directed')

  # graph/vertex/edge prefixes
  _edge_prefix, _graph_prefix, _vertex_prefix = (
    '__edge__', '__graph__', '__vertex__')

  # separators
  _path_separator, _chunk_separator, _magic_separator = (
    '.', ':', '::')

  _type_token, _types_token, _neighbors_token, _relationship_token = (
    'type', 'types', 'neighbors', 'relationship')

  # extra pre/post-fixes
  _topic_prefix, _topics_prefix, _abstract_prefix, _descriptor_postfix = (
    '__topic__', '__topics__', '__abstract__', '__descriptor__')

  # magic prefixes
  _key_prefix, _kind_prefix, _group_prefix, _index_prefix, _reverse_prefix = (
    '__key__', '__kind__', '__group__', '__index__', '__reverse__')

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
  def descriptors(self, subject, type=None, **kwargs):  # pragma: no cover

    ''' Specifies an abstract interface for retrieving an object's
        ``Descriptor``s, which are tiny decorator objects attached to parent
        objects to specify extra data or metadata. '''

    raise NotImplemented('`descriptors` is abstract.')

  @abc.abstractmethod
  def traverse(self, subject, limit, depth):  # pragma: no cover

    ''' Build a graph structure, originating from ``subject``, stepping out by
        a maximum of ``depth`` steps and limiting branches to the top ``limit``
        results. '''

    raise NotImplemented('`traverse` is abstract.')


class RedisWarehouse(WarehouseAdapter, redis.RedisAdapter):

  ''' Redis-backed implementation of the fcm-proprietary abstract
      ``WarehouseAdapter``. Powered by Canteen's builtin Redis driver. '''


  # engine configuration
  class EngineConfig(redis.RedisAdapter.EngineConfig):

    ''' Configuration for the `RedisWarehouse` engine. '''

    serializer = msgpack
    compression = snappy
    mode = redis.RedisMode.hashkey_blob


  class Operations(redis.RedisAdapter.Operations):

    ''' Configuration for custom catnip engine operations. '''

    MSSCAN = ('CATNIP', 'MSSCAN')  # multi-set-scan
    MZSCAN = ('CATNIP', 'MZSCAN')  # multi-sorted-set-scan
    TRAVERSE = ('CATNIP', 'TRAVERSE')  # n-depth graph traversal


  # script loader
  scripts = {n: i for n, i in (
    load_script(os.path.join(dp, f)) for dp, dn, fn in (
      os.walk(config.app['paths']['scripts']['db'])) for f in fn)}

  @decorators.classproperty
  def config(self):

    ''' Return adapter config. '''

    from fatcatmap import config
    return config.config['RedisWarehouse']

  ## +=+=+ Low-level Methods +=+=+ ##
  @classmethod
  def execute(cls, operation, kind, *args, **kwargs):

    """ Acquire a channel and execute an operation, optionally buffering the
        command.

        :param operation: Operation name to execute (from
          :py:attr:`RedisAdapter.Operations`).

        :param kind: String :py:class:`model.Model` kind to acquire the channel
          for.

        :param args: Positional arguments to pass to the low-level operation
          selected.

        :param kwargs: Keyword arguments to pass to the low-level operation
          selected.

        :returns: Result of the selected low-level operation. """

    if isinstance(operation, tuple) and operation[0] == 'CATNIP':

      if operation[1] not in cls.scripts:
        raise RuntimeError('Invalid script requested: "%s".' % operation[1])

      # it's a script - check to see if it's loaded
      try:
        return cls.execute(*tuple([
          cls.Operations.EVALUATE_STORED,             # operation
          '__meta__',                                 # kind
          cls.scripts[operation[1]][0],               # script hash
          len(kwargs.get('keys', []))] + (            # of key arguments
            kwargs.get('keys', [])) + (     # key arguments
            [i for i in args])))                      # positional arguments

      except wire_errors.NoScriptError:

        # load it and try again
        r_hash = cls.execute(*(
          cls.Operations.SCRIPT_LOAD,
          '__meta__', cls.scripts[operation[1]][1]))

        assert r_hash == cls.scripts[operation[1]][0], (
          "script hashes must stay consistent (for db script '%s')" % operation[1])

        return cls.execute(operation, kind, *args, **kwargs)
    return super(RedisWarehouse, cls).execute(operation, kind, *args, **kwargs)

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

  def traverse(self, subject, limit, depth):

    ''' Build a graph structure, originating from ``subject``, stepping out by
        a maximum of ``depth`` steps and limiting branches to the top ``limit``
        results. '''

    return self.execute(self.Operations.TRAVERSE, '__meta__', depth, limit, keys=[
      subject.urlsafe() if isinstance(subject, model.Key) else subject])


adapter.concrete += [RedisWarehouse]  # install adapters
