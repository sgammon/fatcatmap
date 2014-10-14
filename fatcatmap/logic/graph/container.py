# -*- coding utf-8 -*-

'''

  fcm: graph container logic

'''

# stdlib
from hashlib import sha1
from collections import deque
from collections import defaultdict

# local
from .options import Options

# canteen
from canteen import query
from canteen import model
from canteen import struct
from canteen import decorators


## Globals
ddict = lambda: defaultdict(dict)
setdict = lambda: defaultdict(set)
keyify = lambda x: (isinstance(x, model.Key) and x) or x.key



def keytype(key):

  ''' Resolves an appropriate model category (``Vertex``, ``Edge`` or
      ``Model``), given a key. Shortcut for telling whether a key or
      model instance is a graph object or not.

      :param key: :py:class:`model.Key` instance to calculate a model
        category for.

      :raises TypeError: If the given ``key`` makes no sense whatsoever.

      :returns: ``Vertex`` if the ``key`` is for a model type that is a
        ``Vertex``, or ``Edge`` in similar circumstances. Otherwise,
        always returns ``Model``. '''

  from fatcatmap import models

  kind = models.get_warehouse().registry[keyify(key).kind]

  if not hasattr(kind, '__graph__'): return models.BaseModel
  if hasattr(kind, '__vertex__'): return models.BaseVertex
  if hasattr(kind, '__edge__'): return models.BaseEdge

  raise ValueError('Target key "%s" is malformed.' % key)


class Graph(object):

  ''' Describes the structure of a graph, with nodes and edges connecting
      them in between. Keeps track of the separate tasks of discovering
      graph structure and fulfilling the objects behind it. '''

  __options_class__ = Options  # class to use for query options

  __slots__, __defaults__ = zip(*((('__%s__' % b[0], b) for b in (

     ('weakref', struct.EMPTY),

     # ~~ basic ~~ #
     ('origin', None),  # perspective node anchoring this graph structure
     ('adapter', None),  # holds the active model adapter for this `Graph`
     ('options', None),  # holds query options describing traversal params
     ('traversed', set),  # holds (v, limit, depth) that have been traversed

     # ~~ storage ~~ #
     ('keys', deque),  # positional storage
     ('kinds', set),  # model kinds encountered
     ('edges', set),  # unique set of edges encountered
     ('keybag', set),  # unique set of all keys encountered
     ('lookup', dict),  # translates keys to positional integers
     ('window', sha1),  # hash function window for graph fingerprint
     ('objects', dict),  # objects, when they have been fulfilled from keys
     ('network', setdict),  # neighborship sets like source --> {target...}
     ('vertices', set),  # vertices as they are seen during graph traversal
     ('serialized', dict),  # serialized representations of objects and keys
     ('descriptors', ddict)  # holds descriptor dictionaries for each object

    ))))

  __defaults__ = dict(__defaults__)  # re-map into dictionary

  def __init__(self, adapter, **options):

    ''' Initialize the local ``Graph`` object with query ``options``.

        :param options: Accepted as keyword arguments. An explicitly-set
          :py:class:`Options` instance can be offered at ``options=`` or
          otherwise all are passed along to the constructor for the local
          ``options_class``, which defaults to :py:class:`Options`. '''

    for entry, value in self.defaults.iteritems():  # fill out options with defaults
      if value is not struct.EMPTY:
        setattr(self, '__%s__' % entry, value() if callable(value) else value)

    # consider options and adapter
    self.__adapter__ = adapter
    self.set_options(options.get('options') or self.options_class(**options))

  ## ~~ internals ~~ ##
  def __repr__(self):

    ''' Generate a human-friendly string representation of this ``Graph``
        instance, like ``Graph(origin, options)``.

        :returns: ``str`` representation of this ``Graph`` instance. '''

    return "%s(%s, %s)" % (
      self.__class__.__name__, repr(self.origin), repr(self.options))

  def set_options(self, options):

    ''' Set local ``Graph`` query and traversal options.

        :param options: Instance of :py:class:`Options`.
        :returns: ``self``, for chainability. '''

    assert options, "graph options must not be nullsy"
    return setattr(self, '__options__', options) or self

  ## ~~ dynamic properties ~~ ##
  @property
  def queued(self):

    ''' Generate keys that are awaiting objects and need to be fetched.
        Only applies if a ``Graph`` is requested where ``keys_only``
        is not active.

        :returns: :py:class:`model.Key` objects held by the ``Graph``
          for which objects have not yet been fetched, one at a time. '''

    for key in (k for k in self.keys if k not in self.objects):
      yield key

  @property
  def fulfilled(self):

    ''' Generate keys that have already been fulfilled and are known to
        have objects that are currently held by this ``Graph`` instance,
        or ``None``, signifying no object could be found.

        :returns: :py:class:`model.Key` objects for which full data has
          been retrieved, one at a time. '''

    for key in (k for k in self.keys if k in self.objects):
      yield key

  @property
  def fingerprint(self):

    ''' Calculate a string fingerprint that uniquely identifies the keys
        held by this ``Graph`` instance.

        :returns: ``str`` fingerprint for this ``Graph``. '''

    return self.window.hexdigest()

  ## ~~ low-level ~~ ##
  @staticmethod
  def fragment(origin, options):

    ''' Generate a string fragment which can be used to uniquely identify
        this ``Graph`` structure, such that it can be used as an opaque key
        for caching.

        :param origin: Origin ``Vertex`` key that a graph was/can be
          assembled from.

        :param options: Graph ``Options`` for traversal that were/are being
          used.

        :returns: ``str`` instance uniquely describing a potential ``Graph``
          instance. '''

    # generate fragment
    return sha1('.'.join((
                origin.flatten(True)[0],
                options.token()))).hexdigest()

  def inflate(self, encoded):

    ''' Inflate a low-level Base64-encoded key string into a proper instance
        of :py:class:`Key`, :py:class:`VertexKey` or :py:class:`EdgeKey`.

        :param encoded: Low-level string representation of a key, which is
          base64-encoded and looks like ``:ParentKind:parent-id:Kind:id``.

        :returns: Instance of :py:class:`Key`, :py:class:`VertexKey` or
          :py:class:`EdgeKey`, depending on the kind of key passed via
          ``encoded``. '''

    from fatcatmap import models

    # check serialization cache
    if encoded in self.serialized: return self.serialized[encoded]

    # no dice, inflate and return
    inflated = (
      keytype(model.Key.from_urlsafe(encoded)).__keyclass__.from_urlsafe(encoded))
    self.serialized[encoded] = inflated
    return inflated

  def consider(self, key):

    ''' Consider a key, after all tests/set checks have passed. Manages local
        objects ``kinds``, ``keys`` and ``keybag``.

        :param key: :py:class:`model.Key` instance to be considered for
          inclusion in this ``Graph`` object.

        :returns: ``self``, for chainability. '''

    # add to sets
    self.keybag.add(key)
    self.kinds.add(key.kind)
    self.window.update(key.urlsafe())

    # add to keybag and objects
    self.keys.append(key)
    self.lookup[key] = len(self.keybag) - 1
    return self

  def encounter(self, key):

    ''' Encounter a key during graph traversal, that belongs to a ``Vertex``,
        ``Edge`` or regular-ass-model.

        :param key: :py:class:`model.Key` instance to "encounter" and consider
          for response.

        :returns: ``self``, for chainability. '''

    from fatcatmap import models

    if key not in self.keybag:

      # process ancestry for collections
      if self.options.collections:
        for ancestor in key.ancestry:
          if ancestor not in self.keybag:
            self.consider(ancestor)
      self.consider(key)
    return self

  ## ~~ high-level ~~ ##
  def traverse(self, origin, limit=None, depth=None):

    ''' Perform a full graph traversal operation, starting at ``origin``,
        until we end up ``self.options.depth`` steps out, and following a
        maximum number of branches determined by ``self.options.limit``
        at each step.

        :param origin: Origin ``Vertex`` to traverse in this operation.

        :param limit: Branch ``limit`` to use for this phase of traversal.
          Defaults to ``None``, which uses the existing ``self.options``
          for this ``Graph``.

        :param depth: Depth to traverse to. Overrides setting of the same
          name on ``self.options``. Defaults to ``None``, which uses the
          existing ``depth`` for this ``Graph`` instance.

        :returns: ``self``, once operations for the desired traversal
          have completed. '''

    if self.origin: raise RuntimeError('Stateful graphs are not yet supported.')

    self.__origin__ = origin  # set current origin

    # resolve limit/depth
    limit, depth = (
      (limit or self.options.limit),
      (depth or self.options.depth))

    # check cache for previously-traversed branches
    if (origin, limit, depth) in self.traversed: return self

    # fetch and unpack response
    graph, edges = (
      tuple(self.adapter.traverse(origin, limit, depth)))

    network = {v: n for v, n in graph}
    lookup = dict((k, i) for (i, k) in enumerate(sorted(network)))

    # inflate vertexes
    for vertex, relationships in (
      (self.inflate(v), rset) for v, rset in network.iteritems()):

      if vertex not in self.vertices:
        self.encounter(vertex)
        self.vertices.add(vertex)

        # then, inflate neighbors as we go and process them
        for neighbor in (self.inflate(n) for n in relationships):
          self.encounter(neighbor)
          self.network[vertex].add(neighbor)

    # inflate edges
    for edge in (self.inflate(e) for e in edges):
      self.encounter(edge)
      self.edges.add(edge)

    self.traversed.add((origin, limit, depth))
    return self

  def fulfill(self, omit=None):

    ''' Fetch objects that belong to keys encountered during graph
        traversal. Keys passed in ``omit`` are not fetched.

        :param omit: ``set`` instance containing ``model.Key`` instances
          to omit from the final output.

        :returns: ``self``, once fulfillment operations are complete. '''

    from fatcatmap import models

    batch = [k for k in set(self.queued) if k not in (omit or set())]
    for key, entity in zip(batch, models.BaseModel.get_multi(batch)):
      self.objects[key] = entity
    return self

  ## ~~ accessors ~~ ##
  (keys, kinds, edges, lookup, window, keybag, origin, adapter, objects,
    network, vertices, traversed, serialized, descriptors, options, defaults, options_class) = (
      property(lambda self: self.__keys__),
      property(lambda self: self.__kinds__),
      property(lambda self: self.__edges__),
      property(lambda self: self.__lookup__),
      property(lambda self: self.__window__),
      property(lambda self: self.__keybag__),
      property(lambda self: self.__origin__),
      property(lambda self: self.__adapter__),
      property(lambda self: self.__objects__),
      property(lambda self: self.__network__),
      property(lambda self: self.__vertices__),
      property(lambda self: self.__traversed__),
      property(lambda self: self.__serialized__),
      property(lambda self: self.__descriptors__),
      property(lambda self: self.__options__, set_options),
      decorators.classproperty(lambda cls: cls.__defaults__),
      decorators.classproperty(lambda cls: cls.__options_class__))
