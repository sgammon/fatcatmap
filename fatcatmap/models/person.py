# -*- coding: utf-8 -*-

'''

  fcm: person models

'''

# graph models
from . import (date,
			         Edge,
               Vertex,
               describe)

# abstract models
from .abstract import Name


@describe(type=Name)
class PersonName(Name):

  '''  '''

  ## -- basic naming -- ##
  given = str, {'indexed': True}
  family = str, {'indexed': True}

  ## -- extra naming -- ##
  prefix = str, {'indexed': True, 'repeated': True}
  postfix = str, {'indexed': True, 'repeated': True}
  nickname = str, {'indexed': True, 'repeated': True}


@describe(root=True)
class Person(Vertex):

  '''  '''

  ## -- personal details -- ##
  name = PersonName, {'indexed': True, 'required': True, 'embedded': True}
  gender = str, {'indexed': True, 'choices': {'m', 'f'}}
  birthdate = date, {'indexed': True, 'default': None}
  deathdate = date, {'indexed': True, 'default': None}
