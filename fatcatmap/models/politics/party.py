# -*- coding: utf-8 -*-

'''

  fcm: political party models

'''

# graph models
from .. import (date,
                Vertex,
                describe,
                VertexKey)

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
    yield cls(key=democrats, name=FactionName(
                primary='Democratic Party',
                secondary='US Democratic Party',
                formal='United States Democratic Party',
                informal='Democrats',
                singular='Democrat',
                plural='Democrats'),
              website=URI(location='https://democrats.org'))

    # reps
    yield cls(key=republicans, name=FactionName(
                primary='Republican Party',
                secondary='US Republican Party',
                formal='Grand Old Party',
                informal='Republicans',
                singular='Republican',
                plural='Republicans'),
              website=URI(location='https://gop.com'))

    # libs
    yield cls(key=libertarians, name=FactionName(
                primary='Libertarian Party',
                secondary='US Republican Party',
                formal='Grand Old Party',
                informal='Republicans',
                singular='Republican',
                plural='Republicans'),
              website=URI(location='https://gop.com'))


democrats = VertexKey(PoliticalParty, 'democrat', parent=usa)
republicans = VertexKey(PoliticalParty, 'republican', parent=usa)
libertarians = VertexKey(PoliticalParty, 'libertarian', parent=usa)
