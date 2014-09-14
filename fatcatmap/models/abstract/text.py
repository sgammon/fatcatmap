# -*- coding: utf-8 -*-

'''
  
  fcm: text models

'''

# abstract models
from .. import (Model,
                describe)



@describe(abstract=True, root=True)
class Prose(Model):

  '''  '''

  pass


@describe
class Description(Prose):

  '''  '''

  pass
