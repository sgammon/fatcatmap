# -*- coding: utf-8 -*-

'''

  fcm: govtrack model bindings

'''

# stdlib
import datetime

# bindings
from . import ModelBinding, bind

# models
from fatcatmap.models.person import Person
from fatcatmap.models.campaign.finance import GenericContributionTotal
from fatcatmap.models.descriptors.stat  import ContributionStat



@bind('finance', 'Contribution')
class Contribution(ModelBinding):

  ''' Creates `Contribution` edges from analyzed/aggregated
      bulk data from Influence Explorer  '''

  fields = [] # header on file, from hive
  contributor_mapping = {
    'C': 'crp',
    'I': 'donor'}

  def convert(self, data):

    ''' Convert legacy data into the target entity.

      :param data: ``dict`` of data to convert.
      :returns: Instance of local target to inflate. '''


    contributor = self.get_by_ext(
      data['contributor_ext_id'],
      provider=self.contributor_mapping[data['contributor_type']], strict=False)

    recipient = self.get_by_ext(
      data['recipient_ext_id'], strict=False)

    if contributor and recipient:

      contribution = GenericContributionTotal(
        contributor, recipient, amount=data['amount'],
        count=data['count'])

      yield contribution

      stat = ContributionStat(contribution)

      yield stat




