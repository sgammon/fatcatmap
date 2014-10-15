# -*- coding: utf-8 -*-

'''

  fcm: Influence explorer(campaign finance) bindings
  Creates the Vertexes needed for creating campaign finance edges

'''

# stdlib
import datetime

# bindings
from . import ModelBinding, bind

# models
from fatcatmap.models.person import Person
from fatcatmap.models.social import religion
from fatcatmap.models.descriptors import ext
from fatcatmap.models.campaign import finance
from fatcatmap.models.politics import campaign
from fatcatmap.models.government import legislative


@bind('influence_explorer', 'contributionvertex')
class ContributionVertex(ModelBinding):

  ''' Creates the Vertexes needed for creating campaign finance edges
   Currently Committees and People'''

  def convert(self, data):

  	''' Convert legacy data into the target entity.

  		:param data: ``dict`` of data to convert.
  		:returns: Instance of local target to inflate. '''

  	pass
