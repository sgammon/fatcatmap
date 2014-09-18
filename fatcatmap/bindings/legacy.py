# -*- coding: utf-8 -*-

'''

  fcm: legacy model bindings

'''

# stdlib
import datetime

# bindings
from . import ModelBinding, bind

# govtrack bindings
from .govtrack import GovtrackPerson

# models
from fatcatmap.models.person import Person
from fatcatmap.models.descriptors import ext
from fatcatmap.models.campaign import finance
from fatcatmap.models.politics import campaign
from fatcatmap.models.government import legislative


@bind('legacy', 'Node')
class NodeConverter(ModelBinding):

  ''' Converts instances of the old ``Node`` model into new
      ``Vertex`` records. '''

  # {u'label': u'Norman_Sisisky_legacy', u'native': u'OkxlZ2lzbGF0b3I6Tm9ybWFuX1Npc2lza3lfbGVnYWN5'}

  def convert(self, data):

    ''' Convert legacy data into the target entity.

      :param data: ``dict`` of data to convert.
      :returns: Instance of local target to inflate. '''

    self.logging.info('----> Converting `Node`...')
    self.logging.info(str(data))
    yield data


@bind('legacy', 'Edge')
class EdgeConverter(ModelBinding):

  ''' Converts instances of the old ``Edge`` model into new
      ``Edge`` records. '''

  # {u'node': [u'Ok5vZGU6QzAwMjkyMDk0', u'Ok5vZGU6TjAwMDAwNDgw'], u'label': u'Genesis HealthCare_C00292094_N00000480_Olympia Snowe', u'native': u'OkNvbnRyaWJ1dGlvbjpDMDAyOTIwOTRfTjAwMDAwNDgw'}

  def convert(self, data):

    ''' Convert legacy data into the target entity.

      :param data: ``dict`` of data to convert.
      :returns: Instance of local target to inflate. '''

    self.logging.info('----> Converting `Edge`...')
    self.logging.info(str(data))
    yield data


@bind('legacy', 'Member', legislative.CommitteeMember)
class MemberConverter(ModelBinding):

  ''' Converts instances of the old ``Member`` model into new
      ``CommitteeMember`` records. '''

  # {u'name': u'Senate Committee on Environment and Public Works', u'senatecode': u'SSEV', u'govtrackid': u'N00012508', u'housecode': u'', u'subname': None, u'committee': u'SSEV', u'role': None, u'committee_type': u'Senate', u'legislator': u'N00012508'}

  def convert(self, data):

    ''' Convert legacy data into the target entity.

      :param data: ``dict`` of data to convert.
      :returns: Instance of local target to inflate. '''

    self.logging.info('----> Converting `Member`...')
    self.logging.info(str(data))
    import pdb; pdb.set_trace()
    yield data


@bind('legacy', 'Committee', legislative.Committee)
class CommitteeConverter(ModelBinding):

  ''' Converts instances of the old ``Committee`` model into new
      ``LegislativeCommittee`` records. '''

  # {u'url': None, u'type': u'', u'super': u'SSAS', u'display': u'Strategic Forces', u'id': u'SSAS16'}

  def convert(self, data):

    ''' Convert legacy data into the target entity.

      :param data: ``dict`` of data to convert.
      :returns: Instance of local target to inflate. '''

    self.logging.info('----> Converting `Committee`...')
    self.logging.info(str(data))
    import pdb; pdb.set_trace()
    yield data


@bind('legacy', 'Contributor', finance.Contributor)
class ContributorConverter(ModelBinding):

  ''' Converts instances of the old ``Contributor`` model into new
      ``Contributor`` records. '''

  # {u'freebase_id': u'/m/0f2v16', u'open_secrets_id': u'C00382226', u'name': u'International Securities Exchange', u'contributor_type': u'C', u'fec_category': u'F2400'}

  def convert(self, data):

    ''' Convert legacy data into the target entity.

      :param data: ``dict`` of data to convert.
      :returns: Instance of local target to inflate. '''

    self.logging.info('----> Converting `Contributor`...')
    self.logging.info(str(data))
    import pdb; pdb.set_trace()
    yield data


@bind('legacy', 'Contribution', finance.CampaignContribution)
class ContributionConverter(ModelBinding):

  ''' Converts instances of the old ``Contribution`` model into new
      ``Contribution`` records. '''

  # {u'contributor_name': u'Monsanto', u'recipient_name': u'Adam Kinzinger', u'contributor': u'C00042069', u'total': 3500.0, u'recipient': u'N00030667', u'cycle': 2012}

  def convert(self, data):

    ''' Convert legacy data into the target entity.

      :param data: ``dict`` of data to convert.
      :returns: Instance of local target to inflate. '''

    self.logging.info('----> Converting `Contribution`...')
    self.logging.info(str(data))
    import pdb; pdb.set_trace()
    yield data


@bind('legacy', 'Recipient', campaign.CandidateCampaign)
class RecipientConverter(ModelBinding):

  ''' Converts instances of the old ``Recipient`` model into new
      ``Campaign`` records. '''

  # {u'freebase_id': u'/m/0fb921', u'open_secrets_id': u'C00106740', u'name': u'Americas Health Insurance Plans'}

  def convert(self, data):

    ''' Convert legacy data into the target entity.

      :param data: ``dict`` of data to convert.
      :returns: Instance of local target to inflate. '''

    self.logging.info('----> Converting `Recipient`...')
    self.logging.info(str(data))
    import pdb; pdb.set_trace()
    yield data


@bind('legacy', 'Legislator', legislative.Legislator)
class LegislatorConverter(ModelBinding):

  ''' Converts instances of the old ``Legislator`` model into new
      ``Legislator`` records. '''

  # {u'lastnamealt': None, u'icpsrid': None, u'govtrack_id': 400574, u'lastnameenc': u'Canady', u'firstname': u'Charles', u'twitterid': None, u'lastname': u'Canady', u'lismemberid': None, u'bioguideid': u'C000107', u'namemod': None, u'fbid': None, u'fecid': None, u'religion': None, u'metavidid': None, u'birthday': u'1954-06-22', u'youtubeid': None, u'gender': u'M', u'osid': u'legacy', u'nickname': None, u'thomas_id': u'00171', u'pvsid': None}

  def ext_id(self, legislator, provider, name, content):

    ''' Create an external ID descriptor. '''

    from canteen import model

    # @TODO(sgammon): descriptors are broken

    if content:
      return ext.ExternalID(
        key=model.Key(ext.ExternalID, '::'.join(map(str, (provider, content))), parent=legislator),
        provider=provider, name=name, content=(str(content),))

  def convert(self, data):

    ''' Convert legacy data into the target entity.

        :param data: ``dict`` of data to convert.
        :returns: Instance of local target to inflate. '''

    person = yield GovtrackPerson(self)

    # legislator
    assert data['govtrack_id'], "legislators must have a govtrack ID"
    legislator = yield legislative.Legislator.new(person, str(data['govtrack_id']))

    assert legislator, "legislator failed to write: %s" % legislator

    # external ID records
    for provider, value in (('govtrack', 'govtrack_id'),
                            ('fec', 'fecid'),
                            ('icpsr', 'icpsrid'),
                            ('twitter', 'twitterid'),
                            ('lis', 'lismemberid'),
                            ('bioguide', 'bioguideid'),
                            ('facebook', 'fbid'),
                            ('metavid', 'metavidid'),
                            ('youtube', 'youtubeid'),
                            ('thomas', 'thomas_id')):
      if data.get(value):
        ext_id = self.ext_id(legislator, provider, 'id', data[value])
        if ext_id:
          result = yield ext_id
