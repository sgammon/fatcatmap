# -*- coding: utf-8 -*-

'''

  fcm: db adapter

'''

# stdlib
import abc

# canteen
from canteen.model.adapter import abstract


class WarehouseAdapter(abstract.GraphModelAdapter):

  '''  '''

  class KeyTranslator(object):

    '''  '''

    class node(object):

      '''  '''

      @staticmethod
      def to_hint(key, **spec):

        '''  '''

        pass

      @staticmethod
      def to_native(key):

        '''  '''

        pass

      @staticmethod
      def to_descriptor(key):

        '''  '''

        pass

      @staticmethod
      def from_native(key):

        '''  '''

        pass

    class hint(object):

      '''  '''

      @staticmethod
      def to_node(key):

        '''  '''

        pass

    class edge(object):

      '''  '''

      @staticmethod
      def to_nodes(key):

        '''  '''

        pass

      @staticmethod
      def to_native(key):

        '''  '''

        pass

      @staticmethod
      def to_descriptor(key):

        '''  '''

        pass

  translate = KeyTranslator()

  @abc.abstractmethod
  def hint(self, subject, data=None, **kwargs):  # pragma: no cover

    '''  '''

    raise NotImplemented('`hint` is abstract.')

  @abc.abstractmethod
  def natives(self, subject, type=None, **kwargs):  # pragma: no cover

    '''  '''

    raise NotImplemented('`natives` is abstract.')

  @abc.abstractmethod
  def attach(self, subject, descriptor, **kwargs):  # pragma: no cover

    '''  '''

    raise NotImplemented('`attach` is abstract.')

  @abc.abstractmethod
  def descriptors(self, subject, type=None, **kwargs):  # pragma: no cover

    '''  '''

    raise NotImplemented('`descriptors` is abstract.')


class RedisWarehouse(WarehouseAdapter):

  '''  '''

  ## +=+=+ Graph Methods +=+=+ ##
  def edges(self, key1, key2=None, type=None, **kwargs):

    '''  '''

    raise NotImplemented('`Redis` graph support not yet implemented.')

  def neighbors(self, key, type=None, **kwargs):

    '''  '''

    raise NotImplemented('`Redis` graph support not yet implemented.')


  ## +=+=+ Proprietary Methods +=+=+ ##
  def natives(self, subject, **kwargs):

    '''  '''

    raise NotImplemented('`Redis` graph support not yet implemented.')

  def attach(self, subject, descriptor, **kwargs):

    '''  '''

    raise NotImplemented('`Redis` graph support is not yet implemented.')

  def descriptors(self, subject, type=None, **kwargs):

    '''  '''

    raise NotImplemented('`Redis` graph support not yet implemented.')


class DatastoreWarehouse(WarehouseAdapter):

  '''  '''

  ## +=+=+ Graph Methods +=+=+ ##
  def edges(self, key1, key2=None, type=None, **kwargs):

    '''  '''

    raise NotImplemented('`Datastore` graph support not yet implemented.')

  def neighbors(self, key, type=None, **kwargs):

    '''  '''

    raise NotImplemented('`Datastore` graph support not yet implemented.')

  ## +=+=+ Proprietary Methods +=+=+ ##
  def natives(self, subject, **kwargs):

    '''  '''

    raise NotImplemented('`Datastore` graph support not yet implemented.')

  def attach(self, subject, descriptor, **kwargs):

    '''  '''

    raise NotImplemented('`Datastore` graph support is not yet implemented.')

  def descriptors(self, subject, type=None, **kwargs):

    '''  '''

    raise NotImplemented('`Datastore` graph support not yet implemented.')
