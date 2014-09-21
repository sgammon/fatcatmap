# -*- coding: utf-8 -*-

'''

  fcm: db adapter

'''

# stdlib
import abc
import json
import base64
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
from canteen import decorators
from canteen.model import adapter
from canteen.model.adapter import redis
from canteen.model.adapter import abstract
from canteen.model.adapter import inmemory


class WarehouseAdapter(abstract.DirectedGraphAdapter):

  ''' Specifies an abstract adapter that is capable of supporting proprietary,
      ``fatcatmap``-related driver functionality. '''

  # extra prefixes
  _topic_prefix = '__topic__'
  _topics_prefix = '__topics__'
  _abstract_prefix = '__abstract__'

  # extra tokens
  _types_prefix = 'types'


  class KeyTranslator(object):

    ''' Specifies an attached object to a ``WarehouseAdapter`` that knows how to
        translate various keys to various other kinds of keys. '''

    class node(object):

      ''' Specifies key transformations from a ``Node``-centric point of
          view. '''

      @staticmethod
      def to_hint(key, **spec):

        ''' Converts a ``Node`` key to a ``Hint`` key, given a ``spec`` where
            the ``Node``'s ``key`` is taken as the origin. '''

      @staticmethod
      def to_native(key, type):

        ''' Converts a ``Node`` key to a ``Native`` key, given the target
            ``Native`` ``type``. '''

      @staticmethod
      def to_descriptor(key, type, name=None):

        ''' Converts a ``Node`` key to a ``Descriptor`` key, given the target
            ``Descriptor`` ``type`` and an optional ``name`` specification. '''

      @staticmethod
      def from_native(key):

        ''' Converts a ``Native`` key to a ``Node`` key. '''


    class hint(object):

      ''' Specifies key transformations from a ``Hint``-centric point of
          view. '''

      @staticmethod
      def to_node(key):

        ''' Converts a ``Hint`` key to a ``Node`` key, using the
            ``Hint``'s specified origin. '''


    class edge(object):

      ''' Specifies key transformations from a ``Edge``-centric point of
          view. '''

      @staticmethod
      def to_nodes(key):

        ''' Extracts member ``Node`` keys for a given ``Edge``. '''

      @staticmethod
      def to_native(key, type):

        ''' Converts an ``Edge`` key to a ``Native`` key, given the target
            ``Native`` type. '''

      @staticmethod
      def to_descriptor(key, type, name=None):

        ''' Converts an ``Edge`` key to a ``Descriptor`` key, given the target
            ``Descriptor`` ``type`` and an optional ``name`` specification. '''

  translate = KeyTranslator()

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

        :param entity:
        :param kwargs:
        :raises:
        :returns: '''

    from fatcatmap import models
    model = entity.__class__

    with entity:
      updates = {}  # updates to apply
      for prop, val in ((model.__dict__[name], val) for name, val in entity):

        # enforce property-level validators
        if 'validate' in prop._options:
          value = updates[prop.name] = prop['validate'](val)

      # apply updates
      if updates: entity.update(updates)

    return super(WarehouseAdapter, self)._put(entity, **kwargs)

  @classmethod
  def generate_indexes(cls, key, entity=None, properties=None):

    ''' Add extra functionality to indexing calls for certain FCM structures,
        for instance:

          - ask the entity for extra indexes
          - apply indexes for topics in freebase
          - apply 2nd-level graph indexes to key root
          - index against abstract types bound to model class
          - marking indexes to send search services

        :param key:
        :param entity:
        :param properties:
        :raises:
        :returns: '''

    from fatcatmap import models

    supergen = super(WarehouseAdapter, cls).generate_indexes
    meta_fcm, prop_fcm, graph_fcm, external = [], [], [], []

    if key and properties is None:
      # @TODO(sgammon): support cleaning proprietary indexes
      return supergen(key)

    # fcm-based extensions
    if hasattr(entity, '__description__'):
      model, description = cls.registry[entity.kind()], entity.__description__

      # abstract type indexes

      # roll-up hierarchy of type abstraction
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

      # prepare typestack for later, along with key root
      typestack = (_t for _t in types(model))
      keyroot = (_k for _k in key.ancestry).next()

      # yield upwards to generate meta/graph/property indexes
      encoded, meta, properties, graph = supergen(key, entity, properties)

      # apply typestack
      for supertype in typestack:
        if supertype.__description__.reindex:
          import pdb; pdb.set_trace()

      # double-level edge/neighbor indexes

      # apply freebase topic indexes
      if description.topic:

        # topics + topic indexes
        meta_fcm.append((cls._topics_prefix, description.topic))
        meta_fcm.append((cls._topic_prefix, base64.b64encode(description.topic)))

      # ask entity for extra indexes
      if hasattr(entity, 'on_index'):
        for extra in entity.on_index(encoded, standard=(tuple(meta), tuple(properties), tuple(graph)),
                                              proprietary=(tuple(meta_fcm), tuple(prop_fcm), tuple(graph_fcm)),
                                              external=external):

          if extra[0] == cls._index_prefix:
            prop_fcm.append(extra)
          elif extra[0] == cls._graph_prefix:
            graph_fcm.append(extra)
          elif extra[0] in frozenset((cls._key_prefix, cls._kind_prefix, cls._group_prefix)):
            meta_fcm.append(extra)
          else:
            raise RuntimeError('Model `on_index` event provided invalid index bundle: "%s".' % extra)

    return (encoded,
            tuple(itertools.chain(meta, meta_fcm)),
            tuple(itertools.chain(properties, prop_fcm)),
            tuple(itertools.chain(graph, graph_fcm)))

  @classmethod
  def write_indexes(cls, writes, graph, **kwargs):

    ''' Override index write functionality to commit external indexes upon
        internal index commit.

        :param writes:
        :param graph:
        :param kwargs:
        :raises:
        :returns: '''

    pass

  ## +=+=+ Abstract Methods +=+=+ ##
  @abc.abstractmethod
  def hint(self, subject, data=None, **kwargs):  # pragma: no cover

    ''' Specifies an abstract interface for retrieving or writing graph ``Hint``
        objects, which accelerate queries by summarizing various traversed Graph
        fragments. '''

    raise NotImplemented('`hint` is abstract.')

  @abc.abstractmethod
  def attach(self, subject, descriptor, **kwargs):  # pragma: no cover

    ''' Specifies an abstract interface for writing descriptors, which are tiny
        decorator objects attached to parent objects. '''

    raise NotImplemented('`attach` is abstract.')

  @abc.abstractmethod
  def native(self, subject, version=None, **kwargs):  # pragma: no cover

    ''' Specifies an abstract interface for retrieving an object's ``Native``,
        which contains implementation-specific data.

        Optionally, a specific ``Native`` ``version`` can be requested. '''

    raise NotImplemented('`native` is abstract.')

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

  def neighbors(self, key, type=None, **kwargs):

    ''' Retrieve neighbor nodes, which are peers across ``edges``, for ``key``,
        optionally filtered by ``type``, from Redis. '''

    raise NotImplemented('`Redis` graph support'
                         ' not yet implemented.')  # pragma: no cover

  ## +=+=+ Proprietary Methods +=+=+ ##
  def native(self, subject, version=None, **kwargs):

    ''' Retrieve an object's ``Native``, which contains implmentation data for a
        given ``subject`` key, optionally by ``version``, from Redis. '''

    raise NotImplemented('`Redis` graph support'
                         ' not yet implemented.')  # pragma: no cover

  def attach(self, subject, descriptor, **kwargs):

    ''' Attach a new ``descriptor`` object to a ``subject`` key, which contains
        extra ancillary data, in Redis. '''

    raise NotImplemented('`Redis` graph support'
                         ' is not yet implemented.')  # pragma: no cover

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
