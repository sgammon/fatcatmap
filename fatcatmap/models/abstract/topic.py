# -*- coding: utf-8 -*-

'''

  fcm: abstract topic models

'''

# graph models
from .. import (Key,
                Model,
                Vertex,
                describe)

# abstract models
from .name import Name


@describe(type=Name)
class TopicName(Name):

  ''' Describes a name for a ``Topic``, including synonyms/alternate terms
      and common keywords. '''


@describe(abstract=True, type=Vertex)
class Topic(Vertex):

  ''' Describes the concept of a ``Topic``, which categorizes various items
      of content and other ``Vertex``es in nested groups defined by the
      areas of concern (varying in specificity) with which they are
      associated. '''

  name = TopicName, {'embedded': True, 'indexed': True}
  super = Key, {'indexed': True}  # supertopic
