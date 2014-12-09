# -*- coding: utf-8 -*-

'''

  fcm: yaml bindings for congress-legislator project committees

'''

# bindings
from . import ModelBinding, bind

# models
from fatcatmap.models.politics.committee import PoliticalCommittee
from fatcatmap.models.person import Person

# legislative models
from fatcatmap.models.government.legislative import (us_house,
                                                     us_senate,
                                                     Committee,
                                                     Legislator,
                                                     us_congress,
                                                     CommitteeMember)


@bind('committees', 'Committees')
class Committees(ModelBinding):

  ''' Creates committees out of committees-current.yaml
      and committees-historical.yaml '''

  def convert(self, data):

    ''' Convert legacy data into the target entity.

      :param data: ``dict`` of data to convert.
      :returns: Instance of local target to inflate.'''

    from canteen import model

    chambers = {
      'joint': (us_congress, Committee.CommitteeType.JOINT),
      'senate': (us_senate, Committee.CommitteeType.MAJOR),
      'house': (us_house, Committee.CommitteeType.MINOR)}

    #define variables needed for all subcommitees
    thomasid = data['thomas_id']
    supercommittee = self.get_by_ext(thomasid, strict=False, keys_only=False)
    chamber = chambers[data['type']]

    jurisdiction = data.get('jurisdiction')
    if jurisdiction:
      try:
        jurisdiction = jurisdiction.decode('unicode_escape', 'ignore').encode('ascii', 'ignore')
      except UnicodeEncodeError:
        pass

    if not supercommittee:
      supercommittee = Committee.new(chamber[0], thomasid, type=chamber[1])

      supercommittee.name.primary, supercommittee.jurisdiction = (
        data['name'], jurisdiction)
      supercommittee.name.code, supercommittee.name.supercode = (thomasid, thomasid)

      yield supercommittee
      yield self.ext_id(supercommittee, 'congress', 'committee', thomasid)

    if data.get('subcommittees'):
      for c in data['subcommittees']:
        cid = thomasid + c['thomas_id']
        if not self.get_by_ext(cid, strict=False):
          committee = Committee.new(chamber[0], cid, type=chamber[1])

          committee.name.primary, committee.jurisdiction = (
            c['name'], jurisdiction)

          #codes / references
          committee.name.code, committee.name.subcode, committee.name.supercode = (
            cid, c['thomas_id'], thomasid)
          committee.super = supercommittee.key

          yield committee
          yield self.ext_id(committee, 'congress', 'committee', cid)


@bind('committees', 'CommitteeMembers')
class CommitteeMembers(ModelBinding):

  ''' Creates `CommitteeMember` edges from committee-membership-current.yaml
      '''

  def convert(self, data):

    ''' Convert legacy data into the target entity.

      :param data: ``dict`` of data to convert.
      :returns: Instance of local target to inflate.'''

    legislator = self.get_by_ext(data['bioguide'], provider='bioguide', strict=False)
    committee = self.get_by_ext(data['key'], provider='congress', strict=False)

    if legislator and committee:
      membership = CommitteeMember(legislator, committee)

      yield membership







