# -*- coding: utf-8 -*-

'''

  fcm: grapher options

'''


## Defaults
_DEFAULT_GRAPH_DEPTH = 1
_DEFAULT_GRAPH_LIMIT = 5


class GraphOptions(object):

  '''  '''

  # Defaults
  defaults = {
    'depth': _DEFAULT_GRAPH_DEPTH,
    'limit': _DEFAULT_GRAPH_LIMIT
  }

  def __init__(self, **options):

    '''  '''

    for option, default in self.defaults.iteritems():
      setattr(self, '__%s__' % option, options.get(option, default))

  def __iter__(self):

    '''  '''

    for option, default in self.defaults.iteritems():
      yield option, getattr(self, option, default)

  def __repr__(self):

    '''  '''

    return "%s(%s)" % (
      self.__class__.__name__,
      ', '.join((
        ('='.join((str(k), str(v)))) for k, v in self)
      ))

  def to_struct(self):

    '''  '''

    return dict(((option, getattr(self, option, self.defaults[option])) for option in self.defaults))

  @classmethod
  def default(cls):

    '''  '''

    return cls(**cls.defaults)

  # Public
  depth = property(lambda self: getattr(self, '__depth__', self.defaults['depth']))
  limit = property(lambda self: getattr(self, '__limit__', self.defaults['limit']))
