# -*- coding: utf-8 -*-

'''

    fcm: geo models

'''

# graph models
from fatcatmap import models
from fatcatmap.models import abstract


class Geopoint(models.Model):

  '''  '''

  latitude = float, {'indexed': True, 'required': True}
  longitude = float, {'indexed': True, 'required': True}
  altitude = float, {'indexed': True, 'required': True}


class Geobounds(models.Model):

  '''  '''

  hash = str, {'indexed': True, 'repeated': True}
  fence = Geopoint, {'embedded': True, 'indexed': True, 'repeated': True}
