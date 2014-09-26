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

  ''' Describes unstructured text, such as prose or other
      forms of written language. '''


@describe(descriptor=True, type=Prose)
class Description(UnstructuredText):

  ''' Describes a description of some thing, as a form of
      written language. '''


@describe(parent=Vertex, type=Prose)
class PressRelease(UnstructuredText):

  ''' Describes an official press release, as a form of
      written language. '''


@describe(parent=Vertex, type=Prose)
class Article(UnstructuredText):

  ''' Describes an article of written language written
      and published in some fashion. '''


@describe(parent=Media, type=Prose)
class Caption(UnstructuredText):

  ''' Describes a small piece of written language carried
      with some other media to give it context. '''


@describe(parent=Vertex, type=Prose)
class Document(UnstructuredText):

  ''' Describes (in general) written language and raw information
      in the form of a physical document. '''


@describe(parent=Vertex, type=Token)
class Title(UnstructuredText):

  ''' Describes written language used to headline another piece of
      content. '''
