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


@describe(descriptor=True, type=Prose)
class Description(UnstructuredText):

  '''  '''


@describe(parent=Vertex, type=Prose)
class PressRelease(UnstructuredText):

  '''  '''


@describe(parent=Vertex, type=Prose)
class Article(UnstructuredText):

  '''  '''


@describe(parent=Media, type=Prose)
class Caption(UnstructuredText):

  '''  '''


@describe(parent=Vertex, type=Prose)
class Document(UnstructuredText):

  '''  '''


@describe(parent=Vertex, type=Token)
class Title(UnstructuredText):

  '''  '''
