# -*- coding: utf-8 -*-

'''

  fcm: abstract naming models

'''

# graph models
from .. import (Model,
                describe)


# abstract model
from .token import Token


@describe(abstract=True, type=Token, reindex=True)
class Name(Model):

  ''' Describes the abstract concept of a string term (or set of
      string terms) assigned to a concept or entity that uniquely
      identifies it amongst other concepts or entities. '''

  primary = str, {'indexed': True}
  secondary = str, {'indexed': False, 'repeated': True}
