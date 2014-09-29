# -*- coding utf-8 -*-

'''

  fcm: graph logic

'''

# stdlib
import collections

# canteen
from canteen import logic, bind, model


## Globals
_DEFAULT_DEPTH, _DEFAULT_LIMIT = 1, 5


class Options(object):

  '''  '''

  __slots__, __defaults__ = zip(*((('__%s__' % b[0], b) for b in (
                                   ('limit', _DEFAULT_LIMIT),
                                   ('depth', _DEFAULT_DEPTH),
                                   ('query', None),
                                   ('keys_only', False),
                                   ('descriptor', False),
                                   ('keyname', False),
                                   ('graph_spec', None),
                                   ('topic', None),
                                   ('reindex', None)))))


class Graph(object):

  '''  '''

  # ~~ options ~~ #
  __options__, __options_class__ = None, Options

  # ~~ storage ~~ #
  __origin__, __query__ = None, None
  __objects__, __pending__, __graph__ = None, None, None

  def __init__(self):

    '''  '''

    pass


@bind('graph')
class Grapher(logic.Logic):

  '''  '''

  def construct(self, origin, **options):

    '''  '''

    pass
