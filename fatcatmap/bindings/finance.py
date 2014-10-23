# -*- coding: utf-8 -*-

'''

  fcm: govtrack model bindings

'''

# bindings
from . import ModelBinding, bind

# models
from fatcatmap.models.campaign.finance import ContributionStat
from fatcatmap.models.campaign.finance import GenericContributionTotal



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

    from canteen import model

    contributor = self.get_by_ext(
      data['contributor_ext_id'],
      provider=self.contributor_mapping[data['contributor_type']], strict=False)

    recipient = self.get_by_ext(
      data['recipient_ext_id'], strict=False)

    if contributor and recipient:
      #import pdb; pdb.set_trace()

      contribution = GenericContributionTotal.new(
        contributor, recipient, amount=int(data['amount']),
        count=int(data['count']), type=data['transaction_type'])

      yield contribution
      #yield ContributionStat(key=model.Key(ContributionStat, 'stats.campaign.contributions', parent=contribution),
      #                          amount=float(data['amount_rank']),
      #                          count=float(data['count_rank']))
