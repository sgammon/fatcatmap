# -*- coding: utf-8 -*-

'''

    fatcatmap finance models: contributions


    :author: Alexander Rosner <alex@momentum.io>
    :copyright: (c) momentum labs, 2013
    
'''


# canteen models
from canteen import model
from fatcatmap.models import AppModel


# Contribution - A monetary contribution between two entites( see: Contributor, Recipient)
class Contribution(AppModel):
  
  ''' Represents a single Contribution between a 
    :py:class:`contributions.Contributor` 
    and a :py:class:`contributions.Recipient` 
    on the :py:mod:`fatcatmap` graph.'''

  cycle = int,{'indexed': True}
  total = float, {'indexed': True}
  contributor = basestring, {'indexed': True}
  recipient = basestring, {'indexed': True}
  contributor_name = basestring, {'indexed' : True}
  recipient_name = basestring, {'indexed' : True}
