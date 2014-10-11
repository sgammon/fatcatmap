# -*- coding utf-8 -*-

'''

  fcm: graph logic

'''

# stdlib
import base64, uuid, hashlib
from functools import partial
from collections import deque
from collections import defaultdict

# canteen
from canteen import logic, bind
from canteen import model, query
from canteen import decorators, struct


## Globals
_DEFAULT_DEPTH, _DEFAULT_LIMIT = 2, 8
zeros = lambda: defaultdict(lambda: 0)
keyify = lambda t: t if isinstance(t, model.Key) else t.key
get_peers = lambda e: e.peers if getattr(e, 'peers') else (e.source, e.target[0])


class Options(object):

  ''' Describes options that may be passed to a graph query session.
      Must remain hashable and usable as dict keys/partial keys for
      stored graph objects. '''

  params, __defaults__ = zip(*(((b[0], b) for b in (
     ('limit', _DEFAULT_LIMIT),  # limit of edges per pull at each step
     ('depth', _DEFAULT_DEPTH),  # limit of steps to go out from origin
     ('query', None),  # query object to apply during graph traversal
     ('keys_only', True),  # plz return only keys, no objects
     ('descriptors', False),  # fetch descriptors (can be set to query as well)
     ('collections', True)))))  # fetch complete collections of parents and children

  # seal slots, defaults and params
  __slots__, __defaults__, params = (
    tuple((('__%s__' % p) for p in params)), dict(__defaults__), frozenset(params))

  ## ~~ internals ~~ ##
  def __init__(self, **options):

    ''' Initialize this ``Options`` object with kwarg-based ``options``
        which can guide graph traversal and querying operations.

        :param options: Keyword-style options. Available options are
          enumerated in ``options.params``. '''

    for key, value in ((k, options.get(k, struct.EMPTY)) for k in self.params):
      if value is struct.EMPTY: value = self.__defaults__[key]
      setattr(self, '__%s__' % key, value)

  def __iter__(self):

    ''' Provide tuples of ``(k, v)``, where ``k`` is the option name
        and ``v`` is the value of the option with the current set of
        ``Options``.

        :returns: Yields ``(k, v)`` pairs, one-at-a-time. '''

    for key, value in ((k, getattr(self, k, struct.EMPTY)) for k in sorted(self.params)):
      yield key, value if value is not struct.EMPTY else self.defaults[key]

  ## ~~ public ~~ ##
  @classmethod
  def expand(cls, collapsed):

    ''' Expands a collapsed ``Options`` object back into a full
        object again.

        :param collapsed: ``tuple`` generated from ``options.collapse()``. '''

    return cls(**{prop: item for (prop, item) in zip(sorted(cls.params), collapsed)})

  def collapse(self, keys=False):

    ''' Collapse the current ``Options`` instance into a native structure
        that uniquely identifies it. The structure is composed entirely of
        native types (making it serializable or hashable) and sorted by
        property name.

        :param keys: Include parameter names in the output.

        :returns: Generator that provides converted values, one-at-a-time,
          sorted lexicographically by parameter name, optionally with their
          keys in ``(k, v)`` form if ``keys`` is passed as ``True``.  '''

    def convert(item):

      ''' Convert an item for packing into a collapsed structure
          describing an ``Options`` spec.

          :param item: Item to be converted and returned.
          :returns: Native representation for item in packed spec. '''

      if isinstance(item, bool): return (item and 1) or 0
      if isinstance(item, (int, float)): return item
      if isinstance(item, query.Query): return item.pack()
      return item  # that should be all the types

    return ((convert(v) if not keys else (k, convert(v))) for (k, v) in self if v is not None)

  def serialize(self):

    ''' Serialize this set of ``Options`` into a ``dict`` that
        can later be used to respawn it.

        :returns: ``dict`` describing local ``Options`` instance. '''

    return {k: v for (k, v) in self}

  def token(self):

    ''' Produce a unique string describing this ``Options`` object,
        suitable for use as a partial key.

        :returns: Encoded string representation of this :py:class:`Options`
          instance. '''

    return base64.b64encode(':'.join(map(unicode, self.collapse()))).replace('=', '')

  ## ~~ accessors ~~ ##
  limit, depth, query, keys_only, descriptors, collections, defaults = (
    property(lambda self: self.__limit__),
    property(lambda self: self.__depth__),
    property(lambda self: self.__query__),
    property(lambda self: self.__keys_only__),
    property(lambda self: self.__descriptors__),
    property(lambda self: self.__collections__),
    decorators.classproperty(lambda cls: cls.__defaults__))


class Graph(object):

  ''' Describes the structure of a graph, with nodes and edges connecting
      them in between. Keeps track of the separate tasks of discovering
      graph structure and fulfilling the objects behind it. '''

  __options_class__ = Options  # class to use for query options

  __slots__, __defaults__ = zip(*((('__%s__' % b[0], b) for b in (

     ('weakref', struct.EMPTY), ('serialized', dict),

     # ~~ basic parameters ~~ #
     ('origin', None),  # perspective node anchoring this graph structure
     ('options', None),  # holds query options describing the parameters of this graph

     # ~~ traversal state ~~ #
     ('queued', deque),  # holds keys queued for fetch before fulfillment
     ('enqueued', set),  # keeps track of items as they are enqueued
     ('fulfilled', set),  # holds keys fulfilled, moved over from queued

     # ~~ graph storage ~~ #
     ('edges', set),  # holds edges encountered during traversal
     ('vertices', defaultdict(set)),  # holds vertices encountered during traversal

     # ~~ object storage ~~ #
     ('keys', deque),  # keeps track of keys contained in this graph
     ('kinds', set),  # keeps track of entity kinds as they are found
     ('objects', dict),  # keeps track of objects contained in this graph

     # ~~ indexing ~~ #
     ('peers', defaultdict(set)),  # keeps track of vertices in each edge
     ('matrix', defaultdict(zeros)),  # keeps lookup track of neighbors
     ('neighbors', defaultdict(set))))))  # keeps track of neighborship

  __defaults__ = dict(__defaults__)  # re-map into dictionary

  def __init__(self, **options):

    ''' Initialize the local ``Graph`` object with query ``options``.

        :param options: Accepted as keyword arguments. An explicitly-set
          :py:class:`Options` instance can be offered at ``options=`` or
          otherwise all are passed along to the constructor for the local
          ``options_class``, which defaults to :py:class:`Options`. '''

    for entry, value in self.__defaults__.iteritems():  # fill out options with defaults
      if value is not struct.EMPTY:
        setattr(self, '__%s__' % entry, value() if callable(value) else value)

    # consider options
    self.set_options(options.get('options') or self.__options_class__(**options))

  def set_options(self, options):

    ''' Set local ``Graph`` query and traversal options.

        :param options: Instance of :py:class:`Options`.
        :returns: ``self``, for chainability. '''

    assert options, "graph options must not be nullsy"
    return setattr(self, '__options__', options) or self

  ## ~~ low-level ~~ ##
  def encounter(self, key):

    ''' encounter a key '''

    target = key if not isinstance(key, model.Model) else key.key

    for item in target.ancestry:
      self.kinds.add(item.kind)

      if item not in self.enqueued:
        self.queued.append(item)
        self.enqueued.add(item)

    return key  # encounter key

  def traverse(self, key, perspective=None, _depth=0):

    ''' traverse through a key to its neighbors '''

    from fatcatmap import models

    assert (perspective is None and _depth == 0) or (
            perspective is not None and _depth > 0), (
            "origin traversal must have no perspective and vice versa")

    # file origin if not attached
    if not self.origin: self.__origin__ = key

    yield self.encounter(key)  # encounter node keys at leaf

    # break if we've hit our depth limit for this branch
    if self.options.depth <= _depth: raise StopIteration()

    # otherwise, proceed
    for edge in models.Vertex(key=key).edges().fetch(limit=self.options.limit):
      yield self.encounter(edge)

      left, right = get_peers(edge)  # extract edge peers

      # add edge peers
      self.peers[edge].add(left), self.peers[edge].add(right)

      # add as edge and map to vertex
      self.edges.add(edge.key), self.vertices[left].add(edge.key), self.vertices[right].add(edge.key)

      # file away in matrix and adjacency
      self.matrix[left][right], self.matrix[right][left] = 1, 1
      self.neighbors[left].add(right), self.neighbors[right].add(left)

      # spawn next branch of querying, but don't traverse backwards
      for origin in (n for n in (left, right) if n not in (key, perspective)):
        for artifact in self.traverse(origin, perspective=key, _depth=_depth + 1):
          yield artifact

  ## ~~ high-level ~~ ##
  def fulfill(self):

    ''' fulfill queued keys, if requested '''

    from fatcatmap import models

    # build key generator
    for entity in models.BaseModel.get_multi(self.queued):
      self.keys.append(entity.key)
      self.objects[entity.key] = entity

    #self.queued.clear()
    #return self

    #for key in self.queued:
    #  if key not in self.fulfilled:
    #    self.keys.append(key)
    #    self.fulfilled.add(key)
    #    self.objects[key] = models.BaseModel.get(key)

    return self

  @staticmethod
  def fragment(origin, options):

    '''  '''

    # generate fragment
    return hashlib.sha1('.'.join((
                origin.flatten(True)[0],
                options.token()))).hexdigest()

  def export(self, target):

    ''' prepare serialized structure and fill target for response '''

    from fatcatmap import models
    from fatcatmap.services.graph import messages

    if target in self.__serialized__:
      return self.__serialized__[target]

    # unpack objects
    kinds, keys, objects, options = (
      [i for i in sorted(self.kinds)],
      self.keys, self.objects, self.options)

    # unpack graph
    origin, edges, vertices = (
      self.origin, self.edges, self.vertices)

    prereqs = (i for i in keys if i not in vertices and i not in edges)

    # make packed graph
    packed, packed_i, lookup = [], set(), {}
    for group in (prereqs, (origin,), vertices, edges):

      for key in group:
        if key not in packed_i:
          if isinstance(key, model.Model):
            key, entity = key.key, key
          else:
            if key not in objects:
              print "FAILED TO FIND NODE IN RESPONSE: %s" % key
              entity = models.Model.__adapter__.registry[key.kind].get(key)
            else:
              entity = objects[key]

          packed_i.add(key)

          # add to packed objects
          packed.append((key, entity))
          lookup[key] = len(packed) - 1

    # reference node peers with integers instead of strings
    if not options.keys_only:
      for k, o in packed:
        if hasattr(o, 'peers'):
          symbols = []
          for inner_peer in o.peers:
            symbols.append(lookup[inner_peer])
          o.peers = symbols

    # generate final mappings
    mappings, mapped, vstart = [], set(), None
    for i, (key, item) in enumerate(packed):

      # set boundary for vertices
      if not vstart and (key == origin):
        vstart = i + 1
      if isinstance(item, models.Vertex) and vstart:
        _window = []
        for edge in vertices[key]:
          if edge not in mapped:
            _window.append(lookup[edge])
            mapped.add(edge)

        if _window:
          mappings.append(','.join(map(unicode, _window)))
        else:
          mappings.append('')
      elif vstart:
        mappings.append('')

    def pack(key):

      ''' Produce a small structure representing a ``Key``
          instance in a graph response. '''

      structure = [kinds.index(key.kind), key.id]
      if key.parent: structure.append(lookup[key.parent])
      return ':'.join(map(unicode, structure))

    # pack first round of keys
    final = []
    for i, e in packed:
      _p = pack(i)
      if _p is not struct.EMPTY:
        final.append(_p)

    result = self.__serialized__[target] = target(

      session=unicode(uuid.uuid4()),

      # ~~ metadata ~~ #
      meta=messages.Meta(
        kinds=kinds,
        counts=[len(vertices), len(edges), len(keys)],
        cached=False,  # always fresh, for now
        options=self.options.serialize(),
        fragment=self.fragment(origin, options)),

      # ~~ raw data ~~ #
      data=messages.Data(
        keys=final,
        objects=(
          ([messages.GraphObject(data=o.to_dict(), cached=False) for k, o in packed]
            )  if not options.keys_only else [])),

      # ~~ graph structure ~~ #
      graph=messages.Graph(
        origin=lookup[origin],
        boundary=vstart,
        structure=':'.join(mappings)))

    return result

  ## ~~ accessors ~~ ##
  (origin, options, queued, fulfilled, peers,
    enqueued, edges, vertices, keys, kinds, objects,
    matrix, neighbors, defaults) = (
      property(lambda self: self.__origin__),
      property(lambda self: self.__options__),
      property(lambda self: self.__queued__),
      property(lambda self: self.__fulfilled__),
      property(lambda self: self.__peers__),
      property(lambda self: self.__enqueued__),
      property(lambda self: self.__edges__),
      property(lambda self: self.__vertices__),
      property(lambda self: self.__keys__),
      property(lambda self: self.__kinds__),
      property(lambda self: self.__objects__),
      property(lambda self: self.__matrix__),
      property(lambda self: self.__neighbors__),
      decorators.classproperty(lambda cls: cls.__default__))


@bind('graph')
class Grapher(logic.Logic):

  '''  '''

  caching = False  # graph caching killswitch
  options = Options  # attach graph options

  def construct(self, session, origin, emitter=None, **options):

    '''  '''

    from fatcatmap import models
    from fatcatmap.services.graph import messages as gstruct

    # get options and origin
    options, origin = Options(**options), (
      origin or model.Key.from_urlsafe("OlBlcnNvbjoyMzQ0OkxlZ2lzbGF0b3I6NDAwMjYz"))

    # generate fragment
    fragment = Graph.fragment(origin, options)

    graph = gstruct.Graph.get(model.Key(gstruct.GraphResponse, fragment),
                              adapter=models.BaseModel.__adapter__)
    if graph:
      # trim cache
      if not self.caching:
        graph.delete()
      else:
        if not emitter: mapper = lambda x: x
        else: mapper = partial(emitter, graph)
        mapper(graph)  # hand graph in all-at-once if cached
        return graph

    # build graph
    graph = Graph(options=options)

    if not emitter: mapper = lambda x: x
    else: mapper = partial(emitter, graph)

    # perform traversal
    map(mapper, graph.traverse(origin))
    graph.fulfill()

    # optionally, fulfill, then set cache and return
    response = graph.export(gstruct.GraphResponse)
    response.key = model.Key(gstruct.GraphResponse, fragment)
    if self.caching:
      response.put(adapter=models.BaseModel.__adapter__)
    return response
  