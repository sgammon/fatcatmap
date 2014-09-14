# -*- coding: utf-8 -*-

'''

  fcm: model bindings

'''

# stdlib
import collections


## Globals
_bindings = collections.defaultdict(lambda: collections.defaultdict(dict))


class ModelBinding(object):

  ''' Represents a binding between two schemas. '''

  @property
  def logging(self):

  	''' Return a logging pipe. '''

  	from canteen.util import debug
  	return debug.Logger(name=self.__class__.__name__)

  @classmethod
  def resolve(cls, _type, _kind=None):

  	''' Resolve a model binding by _type and potentially also _kind. '''

  	if not _kind:
	  return _bindings[_type]
	return _bindings[_type].get(_kind)

  @classmethod
  def register(cls, _type, _kind):

  	''' Register a local ModelBinding. '''

  	global _bindings

  	def do_register_binding(target):

  	  ''' Closure to register the binding. '''

  	  _bindings[_type][_kind] = target
  	  return target

  	return do_register_binding


bind = ModelBinding.register  # alias


__all__ = ('legacy',)
