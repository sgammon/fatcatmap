# -*- coding: utf-8 -*-

'''

  fcm: yaml bindings for congress-legislator project

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

@bind('legislative_yaml', 'Legislator')
class YamlLegislator(ModelBinding):

  ''' Creates legislators out of legislators-current.yaml
      and legislators-historical.yaml '''

  files = ['legislators-current.yaml','legislators-historical.yaml']


  def convert(self, data):

    ''' Convert legacy data into the target entity.

      :param data: ``dict`` of data to convert.
      :returns: Instance of local target to inflate.
       'id' field contains following ids:
       ['thomas', 'opensecrets', 'fec', 'votesmart', 'ballotpedia', 'lis', 'wikipedia', 'bioguide', 'govtrack', 'maplight', 'icpsr', 'cspan', 'house_history', 'washington_post'] '''

    bioguideid = data['id'].get('bioguide')

    if not id:
      raise

    legislator = self.get_by_ext(id,strict=False)

    if not legislator:

      person = Person.new()
      legislator = Legislator.new(person, bioguideid)

      person.name.given, person.name.family, \
      person.name.primary = data['name']['first'], \
                            data['name']['last'], data['name']['official_full']
      bio = data['bio']
      if bio.get('gender'): person.gender = bio['gender'].lower()
      if bio.get('birthday'): person.birthdate = bio['birthday']

      yield person
      yield legislator

      for k,v in data['id'].iteritems():
        if k == "fec": # 'fec' is a list of fecids
          for fecid in v:
            yield self.ext_id(legislator,k,"id",fecid)
        else:
          yield self.ext_id(legislator,k,"id",v)




