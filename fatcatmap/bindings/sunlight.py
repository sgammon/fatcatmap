# -*- coding: utf-8 -*-

'''

  fcm: sunlight model bindings

'''

# bindings
from . import ModelBinding, bind

# models
from fatcatmap.models.campaign.finance import Contributor
from fatcatmap.models.politics.committee import PoliticalCommittee
from fatcatmap.models.person import Person


def parse_name(name):

  '''  '''

  name = name.split(',')
  last = name[0]
  middle = None

  if len(name) > 1:
    # split first name on space to separate middle initial, and prefix
    nameprefix = name[1].split(" ").sort(key=len,reverse=True)
    first = nameprefix[0] # longest item is first name(hopefully)

    for i in nameprefix:
      if len(i) == 1:
        middle = i

    full = "%s %s %s" % (first, middle, last)
    return first, middle, last, full

  return "", "", last, last


@bind('sunlight', 'Contributor')
class SunlightContributor(ModelBinding):

  ''' Creates the Vertexes needed for creating campaign finance edges
      Currently Committees and People'''

  params = {
   'fields': ('ext_id', 'name', 'fec_category')}

  def convert(self, data):

    ''' Convert legacy data into the target entity.

      :param data: ``dict`` of data to convert.
      :returns: Instance of local target to inflate. '''

    try:
      contributor = self.get_by_ext(data['ext_id'], provider='donor')

    except RuntimeError:
      person = Person.new()


      (person.name.given, person.name.middle,
        person.name.family, person.name.primary) = parse_name(data['name'])

      yield person

      contributor = Contributor.new(person, fec_category=data['fec_category'])

      yield contributor
      yield self.ext_id(contributor, "donor", "id", data['ext_id'])


@bind('sunlight', 'ContributorOrganization')
class SunlightOrganizationContributor(ModelBinding):

  ''' Creates the Vertexes needed for creating campaign finance edges
      Currently Committees and People'''

  params = {
   'fields': ('ext_id', 'name', 'fec_category')}

  def convert(self, data):

    ''' Convert legacy data into the target entity.

      :param data: ``dict`` of data to convert.
      :returns: Instance of local target to inflate. '''

    try:
      contributor = self.get_by_ext(data['ext_id'], provider='crp')

    except RuntimeError:

      committee = PoliticalCommittee.new()
      committee.name.formal = data['name']
      yield committee

      contributor = Contributor(
        key=Contributor.__keyclass__(Contributor, data['ext_id'], parent=committee),
        fec_category=data['fec_category'])
      contributor = yield contributor

      yield self.ext_id(contributor.key, "crp", "id", data['ext_id'])
