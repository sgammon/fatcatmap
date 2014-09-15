# -*- coding: utf-8 -*-

'''

  fcm: legacy model bindings

'''

from . import ModelBinding, bind

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
    yield data


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
    import pdb; pdb.set_trace()
    yield data


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
    import pdb; pdb.set_trace()
    yield data


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
    import pdb; pdb.set_trace()
    yield data


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
    import pdb; pdb.set_trace()
    yield data


@bind('legacy', 'Legislator')
class LegislatorConverter(ModelBinding):

  ''' Converts instances of the old ``Legislator`` model into new
      ``Legislator`` records. '''

  # {u'lastnamealt': None, u'icpsrid': None, u'govtrack_id': 400574, u'lastnameenc': u'Canady', u'firstname': u'Charles', u'twitterid': None, u'lastname': u'Canady', u'lismemberid': None, u'bioguideid': u'C000107', u'namemod': None, u'fbid': None, u'fecid': None, u'religion': None, u'metavidid': None, u'birthday': u'1954-06-22', u'youtubeid': None, u'gender': u'M', u'osid': u'legacy', u'nickname': None, u'thomas_id': u'00171', u'pvsid': None}

  target = legislative.Legislator

  def ext_id(self, ext_ids, legislator, provider, name, content):

    ''' Create an external ID descriptor. '''

    if content:
      ext_ids.append(legislator.attach(ext.ExternalID.new(legislator,
        provider=provider, name=name, content=str(content))))

  def convert(self, data):

    ''' Convert legacy data into the target entity.

        :param data: ``dict`` of data to convert.
        :returns: Instance of local target to inflate. '''

    self.logging.info('----> Converting `Legislator`...')
    self.logging.info(str(data))

    import pdb; pdb.set_trace()

    person = Person.new()

    # name
    person.name.primary = "%s %s" % (data['firstname'], data['lastname'])
    person.name.given, person.name.family, person.name.nickname = (
      data['firstname'], data.get('lastnameenc', data['lastname']), data.get('nickname'))

    if 'lastnamealt' in data:
      person.name.secondary = '%s %s' % (data['firstname'], data['lastnamealt'])

    # personal details
    if 'birthday' in data:
      person.birthdate = datetime.datetime.strptime(data['birthday'], "%Y-%m-%d")

    if 'gender' in data:
      person.gender = data['gender'].lower()

    person = yield person

    # legislator
    legislator = Legislator.new(person, str(data['govtrack_id']))

    yield legislator

    # external ID records
    ext_ids = []
    self.ext_id(ext_ids, legislator, 'govtrack', 'id', data.get('govtrack_id'))
    self.ext_id(ext_ids, legislator, 'fec', 'id', data.get('fecid'))
    self.ext_id(ext_ids, legislator, 'icpsr', 'id', data.get('icpsrid'))
    self.ext_id(ext_ids, legislator, 'twitter', 'id', data.get('twitterid'))
    self.ext_id(ext_ids, legislator, 'lis', 'id', data.get('lismemberid'))
    self.ext_id(ext_ids, legislator, 'bioguide', 'id', data.get('bioguideid'))
    self.ext_id(ext_ids, legislator, 'facebook', 'id', data.get('fbid'))
    self.ext_id(ext_ids, legislator, 'metavid', 'id', data.get('metavidid'))
    self.ext_id(ext_ids, legislator, 'youtube', 'id', data.get('youtubeid'))
    self.ext_id(ext_ids, legislator, 'thomas', 'id', data.get('thomas_id'))

    yield ext_ids

