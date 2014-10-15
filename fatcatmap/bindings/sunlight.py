# -*- coding: utf-8 -*-

'''

  fcm: sunlight model bindings

'''

# bindings
from . import ModelBinding, bind

# models
from fatcatmap.models.campaign.finance import Contributor
from fatcatmap.models.commercial.business import Corporation


@bind('sunlight', 'Contributor', Contributor)
class SunlightContributor(ModelBinding):

  ''' Creates the Vertexes needed for creating campaign finance edges
   Currently Committees and People'''

  def convert(self, data):

  	''' Convert legacy data into the target entity.

  		:param data: ``dict`` of data to convert.
  		:returns: Instance of local target to inflate. '''

  	pass
