# -*- coding: utf-8 -*-

'''

    fatcatmap legislative models: committee


    :author: Alexander Rosner <alex@momentum.io>
    :copyright: (c) momentum labs, 2013
'''


# canteen models
from canteen import model
from fatcatmap.models import AppModel


# Committee - represents a legislative committee.
class Committee(AppModel):
  
  id = basestring, {'indexed': True, 'required': True}
  super = basestring, {'indexed': True, 'default': None} 
  display = basestring, {'indexed': True}
  type = basestring, {'indexed': True}
  url = basestring, {'indexed': True, 'default': None}
