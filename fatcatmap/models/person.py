# -*- coding: utf-8 -*-

'''

  fcm: person models

'''

# graph models
from . import (Key,
               date,
			         Edge,
               Vertex,
               describe)

# abstract models
from .abstract import Name


@describe(type=Name)
class PersonName(Name):

  ''' Describes the structural particulars of a human being's name. '''

  ## -- basic naming -- ##
  given = str, {'indexed': True}
  family = str, {'indexed': True}

  ## -- extra naming -- ##
  prefix = str, {'indexed': True, 'repeated': True}
  postfix = str, {'indexed': True, 'repeated': True}
  nickname = str, {'indexed': True, 'repeated': True}


@describe(root=True)
class Person(Vertex):

  ''' Describes an individual and distinct human being. '''

  ## -- personal details -- ##
  name = PersonName, {'indexed': True, 'required': True, 'embedded': True}
  gender = str, {'indexed': True, 'choices': {'m', 'f'}}
  birthdate = str, {'indexed': True, 'default': None}
  deathdate = str, {'indexed': True, 'default': None}
  religion = Key, {'indexed': True, 'embedded': False, 'default': None}
