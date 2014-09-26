# -*- coding: utf-8 -*-

'''

  fcm: abstract place models

'''

# graph models
from .. import (Model,
                describe)

# abstract models
from .name import Name

# geo models
from ..geo import (Geopoint,
                   Geobounds)


@describe(type=Name)
class PlaceName(Name):

  ''' Describes a name for a physical location, either in singular or boundary
      form, that is commonly recognized by some group of people. '''

  long_name = str, {'indexed': True}
  short_name = str, {'indexed': True}


@describe(abstract=True)
class Place(Model):

  ''' Describes an abstract concept of a physical location (either in singular
      or boundary form) known commonly by some name and recognized by some
      group of people. '''

  name = PlaceName, {'indexed': True, 'embedded': True}
  point = Geopoint, {'indexed': True, 'embedded': True}
  boundary = Geobounds, {'indexed': True, 'embedded': True}
