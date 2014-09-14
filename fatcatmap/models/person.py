# -*- coding: utf-8 -*-

'''

  fcm: person models

'''

# graph models
from . import (date,
               Vertex,
               describe)

# abstract models
from .abstract import PersonName


@describe(root=True)
class Person(Vertex):

  '''  '''

  ## -- personal details -- ##
  name = PersonName, {'indexed': True, 'required': True, 'embedded': True}
  gender = str, {'indexed': True, 'choices': {'m', 'f'}}
  birthdate = date, {'indexed': True, 'default': None}
  deathdate = date, {'indexed': True, 'default': None}
