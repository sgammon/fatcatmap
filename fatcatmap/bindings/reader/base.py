# -*- coding: utf-8 -*-

'''

  fcm: binding reader base class

'''

# stdlib
import os
import abc
import glob

# canteen
from canteen import struct


## Globals
quotes = lambda x: '"%s"' if isinstance(x, basestring) else repr(x)


class BindingReader(object):

  ''' Binding reader base class. '''

  __metaclass__ = abc.ABCMeta

  params = {}
  registry = {}
  __config__ = None  # configuration for reader

  def __init__(self, **config):

    ''' Initialize this ``BindingReader``. '''

    self.__config__ = struct.ObjectProxy(config)

  def __enter__(self):

    ''' Enter a session that makes use of this ``BindingReader``,
        loading any files or tables that need to be used for the
        desired ingest job.

        :returns: ``self``, once preparations are complete, such
          that an ``as`` clause in a ``with`` block will end up
          as the current ``BindingReader`` instance. '''

    self.open()
    return self

  def __iter__(self):

    ''' Iteratively fetch and provide this ``BindingReader``'s
        data. Uses an internal protocol behind the scenes to
        buffer/queue/iteratively produce data.

        :returns: Items to be ingested via this ``BindingReader``,
          one-at-a-time. '''

    for block in self.read():
      yield block

  def __exit__(self, exc_type, exc, traceback):

    ''' Finish using this ``BindingReader`` instance for an
        ingest session. Clean up any files/tables/resources
        previously opened and properly handle exceptions.

        :param exc_type: ``exc`` class (descendent of
          :py:class:`Exception`) for the exception that
          occurred in the contextual block bound to the
          current ``BindingReader`` instance, if any.

        :param exc: ``exc`` object (:py:class:`Exception`
          instance) that occurred in the contextual block
          bound to the current ``BindingReader`` instance,
          if any.

        :param traceback: Traceback object matching the
          given ``exc`` object, if an exception was
          encountered inside the protected block.

        :returns: ``True`` to suppress exceptions,
          ``False`` otherwise. Delegates to the method
          ``handle_exception`` on child bindings. '''

    pass

  def __repr__(self):

    ''' Prepare a human-friendly string representation of this
        ``BindingReader`` instance.

        :returns: ``str`` representation of this instance of
          :py:class:`BindingReader`. '''

    return "%s(%s, %s)" % (
      self.__class__.__name__,
      ", ".join(quotes(i) for i in self.sources),
      ", ".join(("%s=%s" % (k, quotes(v))) for k, v in self.config.iteritems()))

  @property
  def config(self):

    ''' Retrieve the active configuration for the current
        ``BindingReader`` instance.

        :returns: ``dict`` configuration for the current
          ``BindingReader`` instance. '''

    return self.__config__

  @classmethod
  def register(cls, *extensions):

    ''' Register a ``BindingReader`` subclass at a set of file
        extensions, such that it will be used when those extensions
        are encountered during ingest.

        :param extensions: Positional arguments are handled as
          file extensions that should resolve to the current ``cls``
          ``BindingReader`` subclass during ingest.

        :returns: Closure function that performs registration upon
          class construction. '''

    def register_reader(target):

      ''' Register the ``target`` ``BindingReader`` subclass.

          :returns: ``target`` ``BindingReader`` subclass, once
            registration is complete. '''

      for extension in extensions:
        cls.registry[extension] = target
      return target
    return register_reader

  @abc.abstractproperty
  def sources(self):

    ''' Fetch resource batches from arguments so that we can
        facilitate automatic construction/destruction of
        ``BindingReader`` instances.

        :raises NotImplementedError: Always, as this method is
          abstract. '''

    raise NotImplementedError('`BindingReader.sources` is abstract.')

  @abc.abstractmethod
  def open(self):

    ''' Prepare for ingest using this ``BindingReader`` subclass.
        Abstract and must be defined by implementing child classes.

        :raises NotImplementedError: Always, as this method is
          abstract. '''

    raise NotImplementedError('`BindingReader.open` is abstract.')

  @abc.abstractmethod
  def read(self):

    ''' Read data from ``source`` on this ``BindingReader``.

        :raises NotImplementedError: Always, as this method is
          abstract. '''

    raise NotImplementedError('`BindingReader.open` is abstract.')

  @abc.abstractmethod
  def close(self):

    ''' Prepare to destroy this ``BindingReader`` by freeing or
        closing any resources opened during preparation.

        :raises NotImplementedError: Always, as this method is
          abstract. '''

    raise NotImplementedError('`BindingReader.open` is abstract.')


class FileReader(BindingReader):

  ''' Base class for readers that read files. '''

  params = {
    'files': None,  # all files for this job
    'subject': None}  # the current file we're on

  @property
  def sources(self):

    ''' Fetch sources for ``FileReader``-based readers.
        :returns: Each source for this ``FileReader``. '''

    assert isinstance(self.config.files, (list, set, tuple)), (
      "must pass iterable of files or iterable of globs as `files`")

    for pattern in self.config.files:
      for match in glob.iglob(os.path.expanduser(os.path.expandvars(pattern))):
        yield match


reader = BindingReader.register
