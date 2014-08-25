# -*- coding: utf-8 -*-

'''

    fcm: person models

'''

# stdlib
import datetime

# graph models
from . import describe, abstract, Vertex


@describe(root=True)
class Person(Vertex):

  '''  '''

  ## -- personal details -- ##
  name = abstract.PersonName, {'indexed': True, 'required': True}
  gender = str, {'indexed': True, 'choices': {'m', 'f', 'o'}}
  birthdate = datetime.date, {'indexed': True, 'default': None}
  deathdate = datetime.date, {'indexed': True, 'default': None}
