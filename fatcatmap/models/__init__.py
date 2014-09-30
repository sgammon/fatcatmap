# -*- coding: utf-8 -*-

'''

  fcm: models

'''

from __future__ import print_function

# stdlib
import time as stdtime
from collections import defaultdict
from datetime import date, time, datetime

# canteen model API
from canteen import meta
from canteen import model
from canteen import struct
from canteen.model import (Key,
                           EdgeKey,
                           VertexKey)


## Globals
fixtures = set()
_spawn = lambda _t: defaultdict(_t)
_ptree, _ttree, _models, _graph = (
  _spawn(set), _spawn(set), {}, _spawn(lambda: _spawn(set)))
tupleify = lambda subj, _def=None: (((subj,) if subj and not (
                                    isinstance(subj, tuple)) else subj) if (
                                    subj is not _def) else _def)


class BaseModel(model.Model):

  ''' Base application model that specifies proper adapter settings. '''

  __adapter__, __description__ = "RedisWarehouse", None

  # created/modified
  created = datetime, {'indexed': True, 'default': lambda _: datetime.now()}
  modified = datetime, {'indexed': True, 'validate': lambda _: datetime.now()}

  @classmethod
  def query(cls, *args, **kwargs):

    ''' Forced passthrough to parent method, such that the model's kind
        remains intact.

        :param args: Positional arguments to pass to the ``Query``
          constructor.

        :param kwargs: Keyword arguments to pass to the ``Query``
          constructor.

        :returns: :py:class:`canteen.model.query.Query` instance. '''

    kwargs['adapter'] = kwargs.get('adapter', cls.__adapter__)
    return model.Model.query(*args, **kwargs) if cls is BaseModel else (
      super(BaseModel, cls).query(*args, **kwargs))


class BaseVertex(BaseModel, model.Vertex):

  ''' Extended-functionality graph ``Vertex`` model, with builtin fcm
      functionality and driver support. '''

  @classmethod
  def new(cls, first=None, second=None, **kwargs):

    ''' Spawn an instance of this model class with a (potentially) enforced
        ``parent`` and/or ``keyname``. Options for the parent classes are
        available in the subtype's ``describe`` declaration.

        :param first: Either an instance of one of the bound ``parent`` classes
          listed in the method definition, or a string ``keyname``, depending
          on the object requirements.

        :param second: Either an instance of one of the bound ``parent`` classes
          listed in the method definition, or a string ``keyname``, depending
          on the object requirements.

        :param **kwargs: Properties to fill with values upon constructing
          the model instance.

        :raises TypeError: If either a ``parent`` or a ``keyname`` are not
          provided, as they are both required parameters. Also raised if
          ``parent`` is not an instance of either :py:class:`Model` or
          :py:class:`Key`, or ``keyname`` is not a string type.

        :raises ValueError: If ``parent`` is not a subclass of the
          registered parent types for this subtype.

        :returns: Resulting subtype instance. '''

    desc = cls.__description__

    # special case: no parent and a keyname means keyname is first
    parent, keyname = None, None
    if desc.keyname and not desc.parent:
      keyname, parent = first, second
    elif desc.parent and desc.keyname:
      parent, keyname = first, second
    elif desc.parent:
      parent, keyname = first, None

    if desc.keyname:
      if keyname is None:
        raise TypeError('`%s` instances require both a key names.' % cls.kind())

      if not isinstance(keyname, basestring):
        raise TypeError('Keyname for `%s` instance must be'
                        ' a string or unicode type. Instead, got'
                        ' item of type "%s".' % (cls, keyname.__class__))
    elif keyname and not desc.keyname:
      raise TypeError('Keyname given for `%s` instance but'
                      ' model accepts no keyname.' % (cls))

    if desc.parent:
      if parent is None:
        raise TypeError('`%s` instances require key parents.' % cls.kind())

      if not isinstance(parent, (model.Model, model.Key)):
        raise TypeError('Parent for `%s` instance must be'
                        ' a valid `Model` or `Key`. Instead, got'
                        ' item of type "%s".' % (cls, parent.__class__))

      if (isinstance(parent, model.Key) and (
            parent.kind not in (p.__name__ for p in tupleify(desc.parent))) or (
          isinstance(parent, model.Model) and not isinstance(parent, desc.parent))):
        raise ValueError('`%s` is not a valid parent object'
                         ' for model class `%s`.' % (parent, cls))

    kwargs.update({
      'key': cls.__keyclass__(cls, keyname, parent=(
        parent.key if isinstance(parent, model.Model) else parent))})

    # add empty submodels if they aren't passed in, otherwise validate
    for prop in (getattr(cls, n) for n in cls.__lookup__):
      if prop._options.get('embedded') and (
        issubclass(prop._basetype, model.Model)):
        if prop.name in kwargs:
          if not isinstance(kwargs[prop.name], prop._basetype):
            raise TypeError('Embedded submodel at prop "%s" must be of type'
                            ' "%s", but got "%s" instead.' % (
                              prop.name,
                              prop._basetype,
                              kwargs[prop.name].__class__))
          submodel = kwargs[prop.name]
        else:
          submodel = prop._basetype.new()
        kwargs[prop.name] = submodel

    return cls(**kwargs)

  @classmethod
  def query(cls, *args, **kwargs):

    ''' Forced passthrough to parent method, such that the model's kind
        remains intact.

        :param args: Positional arguments to pass to the ``Query``
          constructor.

        :param kwargs: Keyword arguments to pass to the ``Query``
          constructor.

        :returns: :py:class:`canteen.model.query.Query` instance. '''

    kwargs['adapter'] = kwargs.get('adapter', cls.__adapter__)
    return model.Vertex.query(*args, **kwargs) if cls is BaseVertex else (
      super(BaseVertex, cls).query(*args, **kwargs))


class BaseEdge(BaseModel, model.Edge):

  ''' Extended-functionality graph ``Edge`` model, with builtin fcm
      functionality and driver support. '''

  native = Key, {'embedded': True, 'indexed': True, 'required': True}

  @classmethod
  def query(cls, *args, **kwargs):

    ''' Forced passthrough to parent method, such that the model's kind
        remains intact.

        :param args: Positional arguments to pass to the ``Query``
          constructor.

        :param kwargs: Keyword arguments to pass to the ``Query``
          constructor.

        :returns: :py:class:`canteen.model.query.Query` instance. '''

    kwargs['adapter'] = kwargs.get('adapter', cls.__adapter__)
    return model.Edge.query(*args, **kwargs) if cls is BaseEdge else (
      super(BaseVertex, cls).query(*args, **kwargs))


class Spec(object):

  ''' Thin class for specifying various model-level schema items and subsequent
      attachment directly to a ``BaseModel`` subtype. '''

  __slots__, __defaults__ = zip(*(('__root__', False),
                                  ('__parent__', None),
                                  ('__type__', None),
                                  ('__abstract__', False),
                                  ('__descriptor__', False),
                                  ('__keyname__', False),
                                  ('__graph_spec__', None),
                                  ('__topic__', None),
                                  ('__reindex__', None)))

  def __init__(self,
               root=False,
               parent=None,
               type=None,
               abstract=False,
               descriptor=False,
               keyname=False,
               topic=None,
               reindex=None):

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
          a primary key/entity name required during instantiation.

        :param topic: ``str`` topic matching this type from ``Freebase``, if any.
          Takes the form of a URI-style path like ``/religion`` or ``/movies``.

        :param reindex: Flag indicating that this type should be indexed against
          when saving indexes for child types. Defaults to ``False``, unless this
          type is ``abstract``, in which case it defaults to ``True``. '''

    # initialize
    self.__root__, self.__parent__, self.__type__, self.__keyname__ = (
      root, tupleify(parent, None), tupleify(type, None), keyname)

    # extended flags
    self.__abstract__, self.__descriptor__, self.__graph_spec__, self.__topic__ = (
      abstract, descriptor, None, topic)
    self.__reindex__ = abstract if (reindex is None) else reindex

  def merge(self, target):

    ''' Merge a ``Spec`` object with another ``Spec`` object, to produce a final
        product where properties from ``other`` that are not on ``self`` carry
        the value they carried on ``other``, and properties shared by both are
        overridden by ``other``.

        :param target: Target :py:class:`Model` subclass.

        :returns: Merged result of combining properties with ``other``, which is
          an instance of ``Spec``, and ``self``. '''

    if issubclass(target, model.Edge):
      setattr(self, '__root__', True)  # all edges are roots

    for base in target.__bases__:
      other = getattr(base, '__description__', None)
      if other:
        for (prop, value), default in zip(other, self.__defaults__):
          if prop == '__type__' and self.__type__:
            continue
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

    global _models

    _l = lambda klass: klass.__name__  # quick utility to extract labels

    assert _l(target) not in _models, (
      'Cannot register duplicate model `%s`.' % _l(target))

    assert not (self.descriptor and self.parent), (
      'Descriptor `%s` cannot restrict `parent` types.' % _l(target))

    assert not (self.abstract and self.descriptor), (
      'Abstract model `%s` cannot be marked as descriptor.' % _l(target))

    if issubclass(target, model.Edge):  # edges must have specs
      assert hasattr(target, '__spec__') and target.__spec__, (
        'Edge (`%s`) must have specification object.' % _l(target))

    if not self.abstract and not self.descriptor:  # validate concrete models

      assert not (self.root and self.parent), (
        'Cannot mark entity `%s` as `root` and with a `parent`.' % _l(target))

      assert self.root or self.parent, (
        'Cannot mark entity `%s` non-root and as parentless.' % _l(target))

    return True  # passed all tests

  def inject(cls, target):

    ''' Inject various useful methods onto a :py:class:`Model` subclass.

        :param target: :py:class:`Model` subclass to inject useful shit
          onto.

        :returns: Original :py:class:`Model` subclass, post-inejction. '''

    def injected_new(cls, *args, **kwargs):

      ''' Default instance spawn method, overridden in subclasses to enforce
          schema. Just passes args and kwargs along to the model constructor.

          :param args: Positional arguments to spawn the target model isntance
            with.

          :param kwargs: Keyword arguments to spawn the target model instance
            with.

          :returns: Spawned :py:class:`Model` instance with positional and
            keyword arguments ``args``/``kwargs``. '''

      return cls(*args, **kwargs)

    if not hasattr(target, 'new'):
      target.new = classmethod(injected_new)

    # unconditionally apply basemodel's adapter
    target.__adapter__ = BaseModel.__adapter__
    return target

  def register(self, target):

    ''' Register a ``target`` :py:class:`Model` subclass in fcm's known model
        tree. Organize it according to its parent and index against edge/vertex
        types specified in any ``__spec__`` attachment.

        :param target: :py:class:`Model` subclass to register.

        :returns: Original :py:class:`Model` subclass, after registration. '''

    global _ttree, _ptree, _graph, _models, fixtures

    # merge self with target
    if self.validate(self.merge(target)):

      # register as regular model
      _models[target.kind()] = target

      # register according to parent
      if self.parent:
        for parent in self.parent:
          _ptree[parent].add(target)

      # register according to type
      if self.type:
        for _type in self.type:
          _ttree[_type].add(target)

      # register according to spec
      if hasattr(target, '__edge__') and target.__edge__:
        spec = target.__spec__

        for peer in tupleify(spec.peering):
          if spec.directed:
            _graph[spec.origin]['out'].add(peer)
            _graph[peer]['in'].add(spec.origin)
          else:
            _graph[spec.origin]['peers'].add(peer)
            _graph[peer]['peers'].add(spec.origin)

      elif hasattr(target, '__vertex__') and target.__vertex__:
        _graph[target]['_root_'] = target

      if hasattr(target, 'fixture'):
        fixtures.add(target)

      # add to `all` alias
      all[target.kind()] = target
      return self.inject(target)

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
  def describe(cls, target=None, **kwargs):

    ''' Alias method, for use as a ``Model`` subtype decorator. Passes through
        to ``Spec`` but only allows ``kwargs``.

        :returns: Constructed ``Spec`` object, describing the parameters
          contained in ``kwargs``, and suitable for use as a closured
          factory. '''

    def _apply(target):

      ''' Apply the `Spec`` description for a ``target`` model class and return
          the resulting callable.

          :param target: Target ``class`` or ``function`` to decorate.

          :returns: Decorated ``target``. '''

      return cls(**kwargs)(target)
    return _apply(target) if target else _apply

  # -- property accessors -- #
  root, type, parent, keyname, descriptor, abstract, graph, topic, reindex = (
    property(lambda self: self.__root__),
    property(lambda self: self.__type__),
    property(lambda self: self.__parent__),
    property(lambda self: self.__keyname__),
    property(lambda self: self.__descriptor__),
    property(lambda self: self.__abstract__),
    property(lambda self: self.__graph_spec__),
    property(lambda self: self.__topic__),
    property(lambda self: self.__reindex__))


def report_structure():  # pragma: no cover

  ''' Print a nice and pretty report about what the model structure looks like
      internally.

      :returns: Nothing - prints it directly. Obviously not meant for use at
        runtime.'''

  import pprint

  print("\n\n")
  print("======================== Model Registry ========================")
  pprint.pprint(_models)
  print("================================================================")
  print("\n")
  print("======================== Model Graph ========================")
  for vertex, groups in _graph.iteritems():
    print(repr(vertex))
    for group in groups:
      if not group.startswith('_'):
        print("  %s:" % group)
        for subobj in groups[group]:
          print("  --- %s" % repr(subobj))
  print("================================================================")
  print("\n")
  print("======================== Type Tree ========================")
  for basetype, subtypes in _ttree.iteritems():
    print(repr(basetype) + ':')
    for subtype in subtypes:
      print('--- %s' % repr(subtype))
  print("================================================================")
  print("\n")
  print("======================== Entity Groups ========================")
  for basetype, subtypes in _ptree.iteritems():
    print(repr(basetype) + ':')
    for subtype in subtypes:
      print('--- %s' % repr(subtype))
  print("================================================================")
  print("\n\n")


# bind model metadata
meta = struct.ObjectProxy({
  'graph': _graph, 'tree': _ttree, 'hierarchy': _ptree})
all = struct.WritableObjectProxy()  # shortcut to all models

# map aliases
describe = Spec.describe
Model, Vertex, Edge = (BaseModel,
                       BaseVertex,
                       BaseEdge)


__all__ = ('abstract',
           'campaign',
           'commercial',
           'content',
           'descriptors',
           'government',
           'politics',
           'social',
           'account',
           'address',
           'geo',
           'graph',
           'person',
           'place',
           'session')
