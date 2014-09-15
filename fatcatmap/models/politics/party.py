# -*- coding: utf-8 -*-

'''

  fcm: political party models

'''

# graph models
from .. import (Key,
                date,
                Vertex,
                describe)

# USA
from ..place import usa

# abstract models
from ..abstract import (Faction,
                        FactionName)

# descriptors
from ..descriptors.ext import URI


@describe(root=True, type=Faction)
class PoliticalParty(Vertex):

  ''' Specifies a group of political actors bound and associated
      by a common set of beliefs, organized into a formal party. '''

  name = FactionName, {'indexed': True, 'embedded': True}
  website = URI, {'embedded': True, 'indexed': True}

  @classmethod
  def fixture(cls):

    ''' Construct base ``PoliticalParty`` entities. '''

    # dems
    yield cls(key=Key(cls, 'democrat', parent=usa), name=FactionName(
                primary='Democratic Party',
                secondary='US Democratic Party',
                formal='United States Democratic Party',
                informal='Democrats',
                singular='Democrat',
                plural='Democrats'),
              website=URI(location='https://democrats.org'))

    # reps
    yield cls(key=Key(cls, 'republican', parent=usa), name=FactionName(
                primary='Republican Party',
                secondary='US Republican Party',
                formal='Grand Old Party',
                informal='Republicans',
                singular='Republican',
                plural='Republicans'),
              website=URI(location='https://gop.com'))

    # libs
    yield cls(key=Key(cls, 'libertarian', parent=usa), name=FactionName(
                primary='Libertarian Party',
                secondary='US Republican Party',
                formal='Grand Old Party',
                informal='Republicans',
                singular='Republican',
                plural='Republicans'),
              website=URI(location='https://gop.com'))
