# -*- coding: utf-8 -*-

'''

  fcm: legacy model bindings

'''

from . import ModelBinding, bind

# models
from fatcatmap.models.campaign import finance
from fatcatmap.models.politics import campaign
from fatcatmap.models.government import legislative


@bind('legacy', 'Node')
class NodeConverter(ModelBinding):

  ''' Converts instances of the old ``Node`` model into new
   	  ``Vertex`` records. '''

  def convert(self, data):

  	''' Convert legacy data into the target entity.

  		:param data: ``dict`` of data to convert.
  		:returns: Instance of local target to inflate. '''

  	self.logging.info('----> Converting `Node`...')
  	self.logging.info(str(data))
  	return data


@bind('legacy', 'Edge')
class EdgeConverter(ModelBinding):

  ''' Converts instances of the old ``Edge`` model into new
   	  ``Edge`` records. '''

  def convert(self, data):

  	''' Convert legacy data into the target entity.

  		:param data: ``dict`` of data to convert.
  		:returns: Instance of local target to inflate. '''

  	self.logging.info('----> Converting `Edge`...')
  	self.logging.info(str(data))
  	return data


@bind('legacy', 'Member')
class MemberConverter(ModelBinding):

  ''' Converts instances of the old ``Member`` model into new
   	  ``CommitteeMember`` records. '''

  # {u'name': u'Senate Committee on Environment and Public Works', u'senatecode': u'SSEV', u'govtrackid': u'N00012508', u'housecode': u'', u'subname': None, u'committee': u'SSEV', u'role': None, u'committee_type': u'Senate', u'legislator': u'N00012508'}

  target = legislative.CommitteeMember

  def convert(self, data):

  	''' Convert legacy data into the target entity.

  		:param data: ``dict`` of data to convert.
  		:returns: Instance of local target to inflate. '''

  	self.logging.info('----> Converting `Member`...')
  	self.logging.info(str(data))

  	import pdb; pdb.set_trace()

  	return data


@bind('legacy', 'Committee')
class CommitteeConverter(ModelBinding):

  ''' Converts instances of the old ``Committee`` model into new
   	  ``LegislativeCommittee`` records. '''

  # {u'url': None, u'type': u'', u'super': u'SSAS', u'display': u'Strategic Forces', u'id': u'SSAS16'}

  target = legislative.Committee

  def convert(self, data):

  	''' Convert legacy data into the target entity.

  		:param data: ``dict`` of data to convert.
  		:returns: Instance of local target to inflate. '''

  	self.logging.info('----> Converting `Committee`...')
  	self.logging.info(str(data))
  	return data


@bind('legacy', 'Contributor')
class ContributorConverter(ModelBinding):

  ''' Converts instances of the old ``Contributor`` model into new
   	  ``Contributor`` records. '''

  # {u'freebase_id': u'/m/0f2v16', u'open_secrets_id': u'C00382226', u'name': u'International Securities Exchange', u'contributor_type': u'C', u'fec_category': u'F2400'}

  target = finance.Contributor

  def convert(self, data):

  	''' Convert legacy data into the target entity.

  		:param data: ``dict`` of data to convert.
  		:returns: Instance of local target to inflate. '''

  	self.logging.info('----> Converting `Contributor`...')
  	self.logging.info(str(data))
  	return data


@bind('legacy', 'Contribution')
class ContributionConverter(ModelBinding):

  ''' Converts instances of the old ``Contribution`` model into new
   	  ``Contribution`` records. '''

  # {u'contributor_name': u'Monsanto', u'recipient_name': u'Adam Kinzinger', u'contributor': u'C00042069', u'total': 3500.0, u'recipient': u'N00030667', u'cycle': 2012}

  target = finance.CampaignContribution

  def convert(self, data):

  	''' Convert legacy data into the target entity.

  		:param data: ``dict`` of data to convert.
  		:returns: Instance of local target to inflate. '''

  	self.logging.info('----> Converting `Contribution`...')
  	self.logging.info(str(data))
  	return data


@bind('legacy', 'Recipient')
class RecipientConverter(ModelBinding):

  ''' Converts instances of the old ``Recipient`` model into new
   	  ``Campaign`` records. '''

  # {u'freebase_id': u'/m/0fb921', u'open_secrets_id': u'C00106740', u'name': u'Americas Health Insurance Plans'}

  target = campaign.CandidateCampaign

  def convert(self, data):

  	''' Convert legacy data into the target entity.

  		:param data: ``dict`` of data to convert.
  		:returns: Instance of local target to inflate. '''

  	self.logging.info('----> Converting `Recipient`...')
  	self.logging.info(str(data))
  	return data


@bind('legacy', 'Legislator')
class LegislatorConverter(ModelBinding):

  ''' Converts instances of the old ``Legislator`` model into new
   	  ``Legislator`` records. '''

  target = legislative.Legislator

  def convert(self, data):

  	''' Convert legacy data into the target entity.

  		:param data: ``dict`` of data to convert.
  		:returns: Instance of local target to inflate. '''

  	self.logging.info('----> Converting `Legislator`...')
  	self.logging.info(str(data))
  	return data


