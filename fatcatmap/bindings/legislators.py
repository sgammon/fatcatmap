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
# descriptor models
from fatcatmap.models.descriptors.ext import URI
from fatcatmap.models.descriptors.ext import Protocols

# content models
from fatcatmap.models.content.images import Portrait


@bind('legislators', 'Legislators')
class Legislators(ModelBinding):

  ''' Creates legislators out of legislators-current.yaml
      and legislators-historical.yaml '''

  def convert(self, data):

    ''' Convert legacy data into the target entity.

      :param data: ``dict`` of data to convert.
      :returns: Instance of local target to inflate.
       'id' field contains following ids:
       ['thomas', 'opensecrets', 'fec', 'votesmart', 'ballotpedia', 'lis', 'wikipedia', 'bioguide', 'govtrack', 'maplight', 'icpsr', 'cspan', 'house_history', 'washington_post'] '''

    bioguideid = data['id'].get('bioguide')

    if not bioguideid:
      raise

    legislator = self.get_by_ext(bioguideid, strict=False)

    if not legislator:

      person = Person.new()

      (person.name.given, person.name.family) = \
        (data['name']['first'], data['name']['last'], )

      if data['name'].get('official_full'):
        person.name.primary = data['name'].get('official_full')
      else:
        person.name.primary = "%s %s" % (person.name.given, person.name.family)

      bio = data.get('bio')
      if bio:  # if bio isn't present its a super old legislator

        if bio.get('gender'): person.gender = bio['gender'].lower()
        if bio.get('birthday'): person.birthdate = bio['birthday']

        yield person

        legislator = Legislator.new(person, bioguideid)
        yield legislator

        for k,v in data['id'].iteritems():
          if k == "fec":  # 'fec' is a list of fecids
            for fecid in v:
              yield self.ext_id(legislator, k, "id", fecid)
          else:
            yield self.ext_id(legislator, k, "id", v)

      else:
        self.logging.info('Skipping old legislator: "%s"...' % person.name.primary)



      # Add image descriptors keyed on bioguide
      for size in ((50, 61), (225, 275), (450, 550)):
        filename = "{w}x{h}/{bio}".format(w=size[0], h=size[1], bio=bioguideid)

        yield Portrait(key=Portrait.__keyclass__(
                          Portrait,
                          'media.official.congress.%s' % (
                            {50: 'sm', 225: 'md', 450: 'lg', 'l': 'hi'}.get(size[0] if size else 'l')),
                          parent=legislator),
                       size=size or (449, 558),
                       default=not size,
                       provider=('bioguideimg', 'congress'),
                       location='raw/congress/' + filename,
                       storage=Portrait.ImageStorage.PROXY,
                       formats=(
                         Portrait.ImageFormat.JPEG,),
                         #Portrait.ImageFormat.WEBP),
                       protocol=(
                        Protocols.HTTP,
                        Protocols.HTTPS))
