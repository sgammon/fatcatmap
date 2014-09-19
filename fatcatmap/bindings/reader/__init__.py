# -*- coding: utf-8 -*-

'''

  fcm: binding readers

'''


class BindingReader(object):

  ''' binding reader base (WIP) '''

  __config__ = None  # configuration for reader

  def __init__(self, config):

    '''  '''

    self.__config__ = config

  def __enter__(self):

    '''  '''

    pass

  def __exit__(self, exc_type, exc, traceback):

    '''  '''

    pass
