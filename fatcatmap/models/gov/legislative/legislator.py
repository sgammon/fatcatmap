# -*- coding: utf-8 -*-

'''

    fatcatmap legislative models: legislator


    :author: Alexander Rosner <alex@momentum.io>
    :copyright: (c) momentum labs, 2013
  
'''


# canteen models
from canteen import model
from fatcatmap.models import AppModel


# Legislator - describes a person who legislates.
class Legislator(AppModel):

  '''  '''


  firstname = basestring, {'indexed': True}
  lastname = basestring, {'indexed': True}
  nickname = basestring, {}
  govtrack_id = long, {'indexed': True}
  thomas_id = basestring, {'indexed': True}
  namemod = basestring, {}
  lastnameenc = basestring, {}
  lastnamealt = basestring, {}
  birthday = basestring, {}  # @TODO(arosner): convert to date property when it works
  gender = basestring, {'indexed': True}
  religion = basestring, {'indexed': True, 'default': None}
  osid = basestring, {'indexed': True, 'default':None}
  bioguideid = basestring, {'indexed': True, 'default': None}
  pvsid = long, {'indexed':True, 'default': None}
  fecid = basestring, {'indexed': True, 'default': None}
  metavidid = basestring, {'indexed': True, 'default': None}
  youtubeid = basestring, {'indexed': True, 'default': None}
  twitterid = basestring, {'indexed': True, 'default': None}
  lismemberid = basestring, {'indexed':True, 'default':None}
  icpsrid = long, {'indexed': True, 'default': None}
  fbid = long, {'indexed': True, 'default': None}
