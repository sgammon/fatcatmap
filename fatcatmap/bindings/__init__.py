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

    self.logging.info('------ Converting %s entity...' % ('' if not self.target else self.target.kind()))

    binding = self.convert(data)
    for result in binding:
      if not result: continue  # skip null values
      if isinstance(result, ModelBinding):
        subbinding = result(data)
        subresponse = None
        for subresult in subbinding:  # collapse sub-binding
          try:
            _subresponse = yield subresult
            if _subresponse:
              if not subresponse:
                subresponse = _subresponse
              subbinding.send(_subresponse)
          except StopIteration:
            break
        if subresponse:
          try:
            binding.send(subresponse)
          except StopIteration:
            continue
      elif isinstance(result, dict):
        yield result
      elif isinstance(result, model.Model):
        yield result.key, result


bind = ModelBinding.register  # alias


__all__ = ('legacy', 'govtrack', 'bigquery')
