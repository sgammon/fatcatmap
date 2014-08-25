# -*- coding: utf-8 -*-

'''

  fcm: models

'''

# stdlib
from datetime import (date,
                      time,
                      datetime)

# canteen model API
from canteen import model
from canteen.model import (Key,
                           EdgeKey,
                           VertexKey)


class BaseModel(model.Model):

  ''' Base application model that specifies proper adapter settings. '''

  __adapter__, __description__ = "RedisWarehouse", None


class BaseVertex(model.Vertex, BaseModel):

  ''' Extended-functionality graph ``Vertex`` model, with builtin fcm
      functionality and driver support. '''

  # Node Data
  label = basestring, {'indexed': True, 'required': True, 'verbose_name': 'Label'}
  native = basestring, {'indexed': True, 'required': False, 'verbose_name': 'Native'}


class BaseEdge(model.Edge, BaseModel):

  ''' Extended-functionality graph ``Edge`` model, with builtin fcm
      functionality and driver support. '''

  # Edge Data
  label = basestring, {'indexed': True, 'required': False, 'verbose_name': 'Label'}
  node = basestring, {'indexed': True, 'repeated': True, 'verbose_name': 'Nodes'}
  native = basestring, {'indexed': True, 'required': False, 'verbose_name': 'Native'}


class ModelSpec(object):

  ''' Thin class for specifying various model-level schema items and subsequent
      attachment directly to a ``BaseModel`` subtype. '''

  __slots__ = ('__root__',
               '__parent__',
               '__type__',
               '__keyname__')

  def __init__(self, root=False, parent=None, type=None, keyname=False):

    ''' Describe a catnip model class with extra, model-level schema. This
        includes any of the following:

        - whether the model is a ``root`` type
        - if the model is not a root type, the ``parent`` for this model
        - if the model implements an abstract model ``type``
        - whether the ``keyname`` is used for anything in entities of this type

        :param root:
        :param parent:
        :param type:
        :param keyname: '''

    self.__root__, self.__parent__, self.__type__, self.__keyname__ = (
      root, parent, type, keyname)

  def __call__(self, target):

    ''' Apply this ``ModelSpec`` object as a decorator to the ``Model`` subtype
        ``target`` class.

        :param target: Target ``class`` or ``function`` to decorate with local
          ``ModelSpec`` object.

        :returns: Decorated ``target``. '''

    return setattr(target, '__description__', self) or target

  @classmethod
  def describe(cls, **kwargs):

    ''' Alias method, for use as a ``Model`` subtype decorator. Passes through
        to ``ModelSpec`` but only allows ``kwargs``.

        :returns: Constructeed ``ModelSpec`` object, describing the parameters
          contained in ``kwargs``, and suitable for use as a closured
          factory. '''

    def _apply_description(target):

      ''' Apply the ``ModelSpec`` description for a ``target`` model class
          and return the resulting callable.

          :param target: Target ``class`` or ``function`` to decorate.

          :returns: Decorated ``target``. '''

      return cls(**kwargs)(target)
    return _apply_description

  # -- property accessors -- #
  root = property(lambda self: self.__root__)
  type = property(lambda self: self.__type__)
  parent = property(lambda self: self.__parent__)
  keyname = property(lambda self: self.__keyname__)


# map aliases
describe = ModelSpec.describe
Model, Vertex, Edge = (BaseModel,
                       BaseVertex,
                       BaseEdge)


__all__ = ('abstract',
           'campaign',
           'government',
           'graph',
           'social',
           'geo',
           'person')
