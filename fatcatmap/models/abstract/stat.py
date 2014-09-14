# -*- coding: utf-8 -*-

'''

    fcm: seat models

'''

# canteen
from canteen import model

# graph models
from .. import describe, Model


@describe(descriptor=True)
class Stat(Model):

  '''  '''


@describe(descriptor=True)
class StatValue(Model):

  '''  '''

  # stat value: can be an int or float
  value = (int, float), {'indexed': True}

  # stat rank: first is global rank, second is category (if any)
  rank = float, {'indexed': True, 'repeated': True}
