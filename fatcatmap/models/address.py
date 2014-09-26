# -*- coding: utf-8 -*-

'''

  fcm: address models

'''

# graph models
from . import (Model,
               describe)

# abstract models
from .abstract import Place

# geo models
from .geo import Geopoint

# place models
from .place import (City,
	                  County,
	                  State,
	                  Nation)


@describe(descriptor=True, type=Place)
class Address(Model):

  ''' Specifies a physical address with a street number/name,
      locations that contain it, postal code. '''

  # -- location -- #
  number = int, {'indexed': True}
  street = str, {'indexed': True}
  postal = int, {'indexed': True}
  point = Geopoint, {'indexed': True, 'embedded': True}

  # -- jurisdiction -- #
  city = City, {'indexed': True}
  county = County, {'indexed': True}
  state = State, {'indexed': True}
  nation = Nation, {'indexed': True}
