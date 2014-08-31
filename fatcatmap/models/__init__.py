# -*- coding: utf-8 -*-

'''

  fcm: models

'''

# stdlib
from collections import defaultdict
from datetime import (date,
                      time,
                      datetime)

# canteen model API
from canteen import meta
from canteen import model
from canteen.model import (Key,
                           EdgeKey,
                           VertexKey)


## Globals
_spawn = lambda _t: defaultdict(_t)
_graph, _tree, _models = (
  _spawn(set), _spawn(dict), set())


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

  __slots__, __defaults__ = zip(*(('__root__', False),
                                  ('__parent__', None),
                                  ('__type__', None),
                                  ('__abstract__', False),
                                  ('__descriptor__', False),
                                  ('__keyname__', False),
                                  ('__graph_spec__', None)))

  def __init__(self,
               root=False,
               parent=None,
               type=None,
               abstract=False,
               descriptor=False,
               keyname=False):

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

        :param abstract: Mark this model as being *abstract* itself, meaning it
          should never be instantiated directly, and is used to categorize and
          make sense of other, more specific :py:class:`Model` subclasses.

        :param descriptor: Mark this model as being a *descriptor*, meaning that
          it can take any ``parent`` and should be indexed heavily against it
          (in addition to being an enforced *child* object).

        :param keyname: ``bool`` flag indicating that this ``Model`` makes
          logical use of its ``Key.name``. Setting this flag to ``True`` makes
          a primary key/entity name required during instantiation. '''

    # initialize
    self.__root__, self.__parent__, self.__type__, self.__keyname__ = (
      root, parent, type, keyname)

    # extended flags
    self.__abstract__, self.__descriptor__, self.__graph_spec__ = (
      abstract, descriptor, None)

  def merge(self, target):

    ''' Merge a ``Spec`` object with another ``Spec`` object, to produce a final
        product where properties from ``other`` that are not on ``self`` carry
        the value they carried on ``other``, and properties shared by both are
        overridden by ``other``.

        :param target: Target :py:class:`Model` subclass.

        :returns: Merged result of combining properties with ``other``, which is
          an instance of ``Spec``, and ``self``. '''

    from canteen import model

    if issubclass(target, model.Edge):
      setattr(self, '__root__', True)  # all edges are roots

    for base in target.__bases__:
      other = getattr(base, '__description__', None)
      if other:
        for (prop, value), default in zip(other, self.__defaults__):
          if value != default and prop not in frozenset((
                                                    '__root__', '__parent__')):
            setattr(self, prop, value)
    return target

  def validate(self, target):

    ''' Validate that a ``target`` :py:class:`Model` subclass is properly formed
        before allowing construction.

        :param target: :py:class:`Model` subclass to be validated against a
          local ``__description__``.

        :raises AssertionError: If an invalid set of flags are passed, such as
          ``root`` being truthy and also passing a value for ``parent`` that is
          not ``None`` or ``False``. Or, not setting an entity as a ``root`` but
          also passing no ``parent``.

        :returns: ``True`` if the ``target`` should be allowed to continue the
          class construction process, or ``False`` otherwise. '''

    _l = lambda klass: klass.__name__  # quick utility to extract labels

    assert not (self.descriptor and self.parent), (
      'Descriptor `%s` cannot restrict their `parent` types.' % _l(target))

    assert not (self.abstract and self.descriptor), (
      'Abstract model `%s` cannot be marked as descriptors.' % _l(target))

    if not self.abstract and not self.descriptor:

      assert not (self.root and self.parent), (
        'Cannot mark entity `%s` as `root` and with a `parent`.' % _l(target))

      assert self.root or self.parent, (
        'Cannot mark entity `%s` non-root and as parentless.' % _l(target))

    return True  # passed all tests

  def register(self, target):

    ''' Register a ``target`` :py:class:`Model` subclass in fcm's known model
        tree. Organize it according to its parent and index against edge/vertex
        types specified in any ``__spec__`` attachment.

        :param target: :py:class:`Model` subclass to register.

        :returns: Original :py:class:`Model` subclass, after registration. '''

    # merge self with target
    if self.validate(self.merge(target)):

      # register as regular model

      # register according to parent

      # register according to spec

      return target

  def __iter__(self):

    ''' Iterate over this ``Spec`` object, yielding ``(key, value)`` pairs of
        model configuration, in the order they are specified in the local set of
        ``__slots__``.

        :returns: ``Spec`` configuration items, one by one. '''

    for key in self.__slots__:
      yield key, getattr(self, key)

  def __call__(self, target):

    ''' Apply this ``Spec`` object as a decorator to the ``Model`` subtype
        ``target`` class.

        :param target: Target ``class`` or ``function`` to decorate with local
          ``Spec`` object.

        :returns: Decorated ``target``. '''

    self.__graph_spec__ = getattr(target, '__spec__', None)
    return self.register(setattr(target, '__description__', self) or target)

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
  root, type, parent, keyname, descriptor, abstract = (
    property(lambda self: self.__root__),
    property(lambda self: self.__type__),
    property(lambda self: self.__parent__),
    property(lambda self: self.__keyname__),
    property(lambda self: self.__descriptor__),
    property(lambda self: self.__abstract__))


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
