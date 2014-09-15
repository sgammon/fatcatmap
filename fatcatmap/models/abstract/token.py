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
