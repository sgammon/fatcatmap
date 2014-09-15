# -*- coding: utf-8 -*-

'''
  
  fcm: text content models

'''

# models
from .. import (Model,
                Vertex,
                describe)

# content models
from ..abstract.token import Token
from ..abstract.content import (Prose,
                                Media,
                                Content)


@describe(abstract=False, type=Content, root=True)
class UnstructuredText(Model):

  '''  '''

  pass


@describe(descriptor=True, type=Prose)
class Description(UnstructuredText):

  '''  '''

  pass


@describe(parent=Vertex, type=Prose)
class PressRelease(UnstructuredText):

  '''  '''

  pass


@describe(parent=Vertex, type=Prose)
class Article(UnstructuredText):

  '''  '''

  pass


@describe(parent=Media, type=Prose)
class Caption(UnstructuredText):

  '''  '''

  pass


@describe(parent=Vertex, type=Prose)
class Document(UnstructuredText):

  '''  '''

  pass


@describe(parent=Vertex, type=Token)
class Title(UnstructuredText):

  '''  '''

  pass
