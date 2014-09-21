# -*- coding: utf-8 -*-

'''

  fcm: abstract token models

'''

# models
from .. import (Model,
                describe)


@describe(abstract=True)
class Token(Model):

  ''' Describes the abstract concept of a string token with special
      meaning, like a proper noun or an ID. '''

  content = basestring, {'indexed': True}

  @classmethod
  def on_index(cls, entity, standard, proprietary, external):

    '''  '''

    # submodels to index against
    from fatcatmap.models.abstract.name import Name

    # naming entities
    if issubclass(entity.__class__, Name):
      for prop, value in ((entity.__class__.__dict__[k], v) for k, v in entity):
        if prop.basetype in (basestring, str, unicode) and (
          isinstance(value, basestring)):
          yield (cls.__adapter__._index_prefix, cls.kind(), 'content', value)
