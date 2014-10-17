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



@bind('finance', 'Contribution')
class Contribution(ModelBinding):

  ''' Creates `Contribution` edges from analyzed/aggregated
      bulk data from Influence Explorer  '''

  fields = [] # header on file, from hive
  provider_mapping = {
    'C': 'crp',
    'I': 'donor'}

  def convert(self, data):

    ''' Convert legacy data into the target entity.

      :param data: ``dict`` of data to convert.
      :returns: Instance of local target to inflate. '''


    contributor = self.get_by_ext(
      data['contributor_ext_id'],
      provider=self.provider_mapping[data['contributor_type']], strict=False)

    recipient = self.get_by_ext(
      data['recipient_ext_id'],
      provider=self.provider_mapping[data['recipient_type']], strict=False)

    if contributor and recipient:


      committee = PoliticalCommittee.new()
      contributor = Contributor.new(committee, fec_category=data['fec_category'])

      committee.name.formal = data['name']

      yield committee
      yield contributor

      yield self.ext_id(contributor, "fec", "id", data['ext_id'])
