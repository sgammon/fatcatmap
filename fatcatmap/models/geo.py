# -*- coding: utf-8 -*-

'''

  fcm: geo models

'''

# graph models
from . import (Model,
               describe)


@describe(descriptor=True)
class Geopoint(Model):

  ''' Describes a single point on the globe, identified by a longitude/
      latitude pair and an optional altitude. '''

  latitude = float, {'indexed': True, 'required': True}
  longitude = float, {'indexed': True, 'required': True}
  altitude = float, {'indexed': True}


@describe(descriptor=True)
class Geobounds(Model):

  ''' Describes a physical boundary on the globe, identified by a set of
      longitude/latitude pairs. '''

  hash = str, {'indexed': True, 'repeated': True}
  fence = Geopoint, {'embedded': True, 'indexed': True, 'repeated': True}
