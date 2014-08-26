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

  native = Key, {'embedded': True, 'indexed': True, 'required': True}


class BaseEdge(model.Edge, BaseModel):

  ''' Extended-functionality graph ``Edge`` model, with builtin fcm
      functionality and driver support. '''

  native = Key, {'embedded': True, 'indexed': True, 'required': True}


class Spec(object):

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

        :param root: ``bool`` flag indicating the target model operates as a
          *root* entity, meaning it never has a *parent* and often has other
          entity *children* placed under it.

        :param parent: Reference to this ``Model`` subclass' expected *parent*
          model, which, if defined, should be a required element to instantiate
          and store the target ``Model``. Defaults to ``None``, indicating no
          parent. Multiple parents can be specified in the form of a ``tuple``
          or ``list`` of other ``Model`` classes. If ``None`` is included in the
          list of ``parent`` ``Model`` classes, having *no* parent is also
          enabled/allowed for the target ``Model``. A ``TypeError`` exception is
          raised if ``parent`` has a value and the target ``Model`` is also
          marked as a ``root`` entity.

        :param type: Abstract type for the target ``Model`` subclass.
          Categorizes disparate models orthogonally to their parent class or
          meta type. Properties from the target ``type`` are mixed-in to the
          target ``Model`` subclass and organized such that they can be queried/
          enumerated given the parent ``type``.

        :param keyname: ``bool`` flag indicating that this ``Model`` makes
          logical use of its ``Key.name``. Setting this flag to ``True`` makes
          a primary key/entity name required during instantiation.

        :raises TypeError: If an invalid set of flags are passed, such as
          ``root`` being truthy and also passing a value for ``parent`` that is
          not ``None`` or ``False``. '''

    if root and parent:  # pragma: no cover
      raise TypeError('Cannot mark an entity with potential `parent` models'
                      ' as a `root` entity.')

    # initialize
    self.__root__, self.__parent__, self.__type__, self.__keyname__ = (
      root, parent, type, keyname)

  def __call__(self, target):

    ''' Apply this ``Spec`` object as a decorator to the ``Model`` subtype
        ``target`` class.

        :param target: Target ``class`` or ``function`` to decorate with local
          ``Spec`` object.

        :returns: Decorated ``target``. '''

    return setattr(target, '__description__', self) or target

  def __repr__(self):

    ''' Generate a pleasant string representation of this ``Spec``, dumping
        enclosed properties and formatting them nicely.

        :returns: String representation for this ``Spec``, in the format
          ``Spec(flagone=True, flagtwo=False, flagthree)``. '''

    return "%s(%s)" % (
      self.__class__.__name__,
        ", ".join((map(lambda item: (
          "=".join((item[0].replace('__', ''),
            repr(item[1]))) if item[1] is not None else (
              item[0].replace('__', ''))), ((
              key, getattr(self, key, None)) for key in self.__slots__)))))

  @classmethod
  def describe(cls, **kwargs):

    ''' Alias method, for use as a ``Model`` subtype decorator. Passes through
        to ``Spec`` but only allows ``kwargs``.

        :returns: Constructed ``Spec`` object, describing the parameters
          contained in ``kwargs``, and suitable for use as a closured
          factory. '''

    def _apply_description(target):

      ''' Apply the `Spec`` description for a ``target`` model class and return
          the resulting callable.

          :param target: Target ``class`` or ``function`` to decorate.

          :returns: Decorated ``target``. '''

      return cls(**kwargs)(target)
    return _apply_description

  # -- property accessors -- #
  root, type, parent, keyname = (
    property(lambda self: self.__root__),
    property(lambda self: self.__type__),
    property(lambda self: self.__parent__),
    property(lambda self: self.__keyname__))


# map aliases
describe = Spec.describe
Model, Vertex, Edge = (BaseModel,
                       BaseVertex,
                       BaseEdge)


__all__ = ('abstract',
           'campaign',
           'commercial',
           'government',
           'graph',
           'social',
           'geo',
           'person')
