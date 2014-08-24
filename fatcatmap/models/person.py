# -*- coding: utf-8 -*-

'''

    fcm: person models

'''

# stdlib
import datetime

# graph models
from fatcatmap import models
from fatcatmap.models import abstract


@models.describe(root=True)
class Person(models.Vertex):

  '''  '''

  ## -- personal details -- ##
  name = abstract.PersonName, {'indexed': True, 'required': True}
  birthdate = datetime.date, {'indexed': True, 'default': None}
  deathdate = datetime.date, {'indexed': True, 'default': None}
