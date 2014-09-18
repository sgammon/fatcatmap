# -*- coding: utf-8 -*-

'''

  fcm: model bindings

'''

# stdlib
import collections

# models
from canteen import model


## Globals
bindings = collections.defaultdict(lambda: collections.defaultdict(dict))


class ModelBinding(object):

  ''' Represents a binding between two schemas. '''

  chain = None  # dependent task that is waiting on this one
  target = None  # target model that is mainly yielded by this binding
  __logging__ = None  # logging target, passed in from caller

  def __init__(self, chain=None, logging=None):

    ''' Initialize the local ``ModelBinding``. '''

    self.chain, self.__logging__ = (
      chain,  # dependent task
      logging)  # logging pipe from caller

  def initialize(self, chain=None, logging=None):

    ''' Re-initialize at a higher context. '''

    self.chain, self.__logging__ = (
      chain or self.chain,
      logging or self.logging)
    return self

  @property
  def logging(self):

    ''' Return a logging pipe. '''

    from canteen.util import debug
    return self.__logging__ or debug.Logger(name=self.__class__.__name__)

  @classmethod
  def resolve(cls, _type, _kind=None):

    ''' Resolve a model binding by _type and potentially also _kind. '''

    if not _kind: return bindings[_type]
    return bindings[_type].get(_kind)

  @classmethod
  def register(cls, _type, _kind, _yields=None):

    ''' Register a local ModelBinding. '''

    global bindings

    def do_register_binding(target):

      ''' Closure to register the binding. '''

      bindings[_type][_kind] = target
      target.target = _yields  # assign target
      return target
    return do_register_binding

  def __call__(self, data):

    ''' Pass off to ``convert``, which is the point of a model binding. '''

    binding = self.convert(data)

    def _rollup(base):

      '''  '''

      item = next(base)
      while item:
        result = None  # result of the deferred call

        if isinstance(item, model.Model):
          result = yield item

        # dependent sub-binding
        elif isinstance(item, ModelBinding):
          subbinding = item.initialize(logging=self.logging)(data)

          for subitem in subbinding:
            result = yield subitem
            if result:
              try:
                item = subbinding.send(result)
              except (GeneratorExit, StopIteration):
                pass

        if result:
          item = base.send(result)
        if not item:
          item = next(base)

    return _rollup(binding)



bind = ModelBinding.register  # alias


__all__ = ('legacy', 'govtrack', 'bigquery')
