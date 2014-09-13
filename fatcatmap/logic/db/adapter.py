# -*- coding: utf-8 -*-

'''

  fcm: db adapter

'''

# stdlib
import abc
import json

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

# canteen
from canteen import decorators
from canteen.model import adapter
from canteen.model.adapter import redis
from canteen.model.adapter import abstract
from canteen.model.adapter import inmemory


class WarehouseAdapter(abstract.GraphModelAdapter):

  ''' Specifies an abstract adapter that is capable of supporting proprietary,
      ``fatcatmap``-related driver functionality. '''

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

        pass

      @staticmethod
      def to_native(key, type):

        ''' Converts a ``Node`` key to a ``Native`` key, given the target
            ``Native`` ``type``. '''

        pass

      @staticmethod
      def to_descriptor(key, type, name=None):

        ''' Converts a ``Node`` key to a ``Descriptor`` key, given the target
            ``Descriptor`` ``type`` and an optional ``name`` specification. '''

        pass

      @staticmethod
      def from_native(key):

        ''' Converts a ``Native`` key to a ``Node`` key. '''

        pass

    class hint(object):

      ''' Specifies key transformations from a ``Hint``-centric point of
          view. '''

      @staticmethod
      def to_node(key):

        ''' Converts a ``Hint`` key to a ``Node`` key, using the
            ``Hint``'s specified origin. '''

        pass

    class edge(object):

      ''' Specifies key transformations from a ``Edge``-centric point of
          view. '''

      @staticmethod
      def to_nodes(key):

        ''' Extracts member ``Node`` keys for a given ``Edge``. '''

        pass

      @staticmethod
      def to_native(key, type):

        ''' Converts an ``Edge`` key to a ``Native`` key, given the target
            ``Native`` type. '''

        pass

      @staticmethod
      def to_descriptor(key, type, name=None):

        ''' Converts an ``Edge`` key to a ``Descriptor`` key, given the target
            ``Descriptor`` ``type`` and an optional ``name`` specification. '''

        pass

  translate = KeyTranslator()

  ## +=+=+ Internal Methods +=+=+ ##
  def _hints(self, subject, **kwargs):

    ''' Internal method that dispatches matching implementation ``hints`` on
        child classes. '''

    pass

  def _native(self, subject, version=None, **kwargs):

    ''' Internal method that dispatches matching implementation ``native`` on
        child classes. '''

    pass

  def _descriptors(self, subject, type=None, **kwargs):

    ''' Internal method that dispatches matching implementation ``descriptors``
        on child classes. '''

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

    serializer = json
    mode = redis.RedisMode.toplevel_blob

  @decorators.classproperty
  def config(self):

    ''' Return adapter config. '''

    from fatcatmap import config

    profile = config.config['RedisWarehouse']['servers']['default']
    return config.config['RedisWarehouse']['servers'][profile]

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
