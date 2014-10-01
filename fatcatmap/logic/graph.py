# -*- coding utf-8 -*-

'''

  fcm: graph logic

'''

# stdlib
import base64
import collections

# canteen
from canteen import logic, bind
from canteen import model, query
from canteen import decorators, struct


## Globals
_DEFAULT_DEPTH, _DEFAULT_LIMIT = 2, 5
zeros = lambda: collections.defaultdict(lambda: 0)
peers = lambda e: e.peers if getattr(e, 'peers') else (e.source, e.target)


class Options(object):

  ''' Describes options that may be passed to a graph query session.
      Must remain hashable and usable as dict keys/partial keys for
      stored graph objects. '''

  params, __defaults__ = zip(*(((b[0], b) for b in (
     ('limit', _DEFAULT_LIMIT),  # limit of edges per pull at each step
     ('depth', _DEFAULT_DEPTH),  # limit of steps to go out from origin
     ('query', None),  # query object to apply during graph traversal
     ('keys_only', False),  # plz return only keys, no objects
     ('descriptor', False),  # fetch descriptors (can be set to query as well)
     ('collections', False)))))  # fetch complete collections of parents and children

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

  def __hash__(self):

    ''' Return a unique and immutable structure describing this
        ``Options`` instance.

        :returns: ``tuple`` describing this ``Options`` object's
          structure via ``self.collapse``. '''

    return tuple(self.collapse())

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
      if isinstance(item, query.Query): return item.__hash__()
      return item  # that should be all the types

    return ((convert(v) if not keys else (k, convert(v))) for (k, v) in self)

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

    return base64.b64encode(':'.join(map(unicode, self.collapse())))

  ## ~~ accessors ~~ ##
  limit, depth, query, keys_only, descriptor, collections, defaults = (
    property(lambda self: self.__limit__),
    property(lambda self: self.__depth__),
    property(lambda self: self.__query__),
    property(lambda self: self.__keysonly__),
    property(lambda self: self.__descriptor__),
    property(lambda self: self.__collections__),
    decorators.classproperty(lambda cls: cls.__defaults__))


class Graph(object):

  ''' Describes the structure of a graph, with nodes and edges connecting
      them in between. Keeps track of the separate tasks of discovering
      graph structure and fulfilling the objects behind it. '''

  __options_class__ = Options  # class to use for query options

  __slots__, __defaults__ = zip(*((('__%s__' % b[0], b) for b in (

     # ~~ basic parameters ~~ #
     ('origin', None),  # perspective node anchoring this graph structure
     ('options', None),  # holds query options describing the parameters of this graph

     # ~~ traversal state ~~ #
     ('queued', lambda: set()),  # holds keys queued for fetch before fulfillment
     ('fulfilled', lambda: set()),  # holds keys fulfilled, moved over from queued

     # ~~ object storage ~~ #
     ('keys', lambda: set()),  # keeps track of keys contained in this graph
     ('objects', lambda: dict()),  # keeps track of objects contained in this graph
     ('matrix', lambda: collections.defaultdict(zeros)),  # keeps lookup track of neighbors
     ('neighbors', lambda: collections.defaultdict(set))))))  # keeps track of neighborship

  __defaults__ = dict(__defaults__)  # re-map into dictionary

  def __init__(self, **options):

    ''' Initialize the local ``Graph`` object with query ``options``.

        :param options: Accepted as keyword arguments. An explicitly-set
          :py:class:`Options` instance can be offered at ``options=`` or
          otherwise all are passed along to the constructor for the local
          ``options_class``, which defaults to :py:class:`Options`. '''

    for entry, value in self.__defaults__.iteritems():  # fill out options with defaults
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
    map(self.__queued__.add, target.ancestry)
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
    for edge in map(self.encounter,  # encounter edge keys as we go
                    models.Vertex(key=key).edges().fetch(limit=self.options.limit)):

      # extract edge peers
      left, right = peers(edge)

      # file away in matrix and adjacency
      self.matrix[left][right], self.matrix[right][left] = 1, 1
      self.neighbors[left].add(right), self.neighbors[right].add(left)

      # spawn next branch of querying
      for origin in (left, right):
        if origin not in (key, perspective):  # don't traverse backwards
          for artifact in self.traverse(origin, perspective=key, _depth=_depth + 1):
            yield artifact

  ## ~~ high-level ~~ ##
  def fulfill(self):

    ''' fulfill queued keys, if requested '''

    from fatcatmap import models

    # build key generator
    for entity in models.BaseModel.get_multi([i for i in self.__queued__]):
      self.keys.add(entity.key)
      self.fulfilled.add(entity.key)
      self.objects[entity.key] = entity
    return self

  ## ~~ accessors ~~ ##
  (origin, options, queued, fulfilled,
    keys, objects, matrix, neighbors, defaults) = (
      property(lambda self: self.__origin__),
      property(lambda self: self.__options__),
      property(lambda self: self.__queued__),
      property(lambda self: self.__fulfilled__),
      property(lambda self: self.__keys__),
      property(lambda self: self.__objects__),
      property(lambda self: self.__matrix__),
      property(lambda self: self.__neighbors__),
      decorators.classproperty(lambda cls: cls.__default__))


@bind('graph')
class Grapher(logic.Logic):

  '''  '''

  def open(self, session, *args, **options):

    '''  '''

    pass
