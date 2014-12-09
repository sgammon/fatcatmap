# -*- coding utf-8 -*-

'''

  fcm: graph traversal options

'''

# stdlib
import base64

# canteen
from canteen import query
from canteen import struct
from canteen import decorators


## Globals
_DEFAULT_DEPTH, _DEFAULT_LIMIT = 2, 8


class Options(object):

  ''' Describes options that may be passed to a graph query session.
      Must remain hashable and usable as dict keys/partial keys for
      stored graph objects. '''

  params, __defaults__ = zip(*(((b[0], b) for b in (
     ('limit', _DEFAULT_LIMIT),  # limit of edges per pull at each step
     ('depth', _DEFAULT_DEPTH),  # limit of steps to go out from origin
     ('query', None),  # query object to apply during graph traversal
     ('keys_only', True),  # plz return only keys, no objects
     ('media', True),  # fetch media descriptors along with vertices
     ('stats', False),  # fetch stat descriptors along with vertices and edges
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

  def __repr__(self):

    ''' Produce a human-friendly string representation of this ``Options``
        object and the settings it encapsulates.

        :returns: String representation of this ``Options`` instance. '''

    return "Options(%s)" % ', '.join(
      ("%s=%s" % (key, repr(value)) for key, value in self))

  ## ~~ public ~~ ##
  @classmethod
  def expand(cls, collapsed):

    ''' Expands a collapsed ``Options`` object back into a full
        object again.

        :param collapsed: ``tuple`` generated from ``options.collapse()``. '''

    return cls(**(
      {prop: item for (prop, item) in zip(sorted(cls.params), collapsed)}))

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
  limit, depth, query, media, stats, keys_only, collections, defaults = (
    property(lambda self: self.__limit__),
    property(lambda self: self.__depth__),
    property(lambda self: self.__query__),
    property(lambda self: self.__media__),
    property(lambda self: self.__stats__),
    property(lambda self: self.__keys_only__),
    property(lambda self: self.__collections__),
    decorators.classproperty(lambda cls: cls.__defaults__))
