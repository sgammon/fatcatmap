# -*- coding: utf-8 -*-

'''

  fcm: political lobbying models

'''

# graph models
from .. import (Vertex,
                describe)

# abstract models
from ..abstract import (Role,
						Event,
						Contract)

# fcm models
from ..person import Person
from ..commercial.business import Corporation
from ..government.executive import ExecutiveOfficial
from ..government.legislative import (Legislator,
                                      Legislation)


## +=+=+=+=+=+=+=+=+ Vertexes +=+=+=+=+=+=+=+=+ ##

@describe(parent=Corporation, type=Role)
class LobbyingFirm(Corporation):

  ''' Specifies a firm that employs ``Lobbyists`` and is
  	  retained by clients to advocate for them on issues
  	  and legislation. '''


@describe(parent=Person, type=Role)
class Lobbyist(Vertex):

  ''' Specifies an individual playing a role where they
      are trying to influence government on their own
      behalf or for someone/something else. '''

  firm = LobbyingFirm, {'indexed': True, 'default': None, 'embedded': False}


## +=+=+=+=+=+=+=+=+ Edges +=+=+=+=+=+=+=+=+ ##

@describe(type=Contract)
class Retains(Corporation >> LobbyingFirm):

  ''' Specifies a relationship between a ``Corporation``
  	  and a ``LobbyingFirm`` where the firm is retained
  	  to advocate on their behalf. '''


@describe(type=Event)
class LegislationLobbying(Lobbyist >> Legislation):

  ''' Specifies activity performed by a ``Lobbyist``,
      sometimes under the banner of a ``LobbyingFirm``
      but always on behalf of a client. '''


@describe(type=Event)
class LegislatorLobbying(Lobbyist >> Legislator):

  ''' Specifies activity performed by a ``Lobbyist``,
      sometimes under the banner of a ``LobbyingFirm``
      but always on behalf of a client, to sway the
      opinion of or gain influcen from a ``Legislator``. '''


@describe(type=Event)
class ExecutiveLobbying(Lobbyist >> ExecutiveOfficial):

  ''' Specifies activity performed by a ``Lobbyist``,
      sometimes under the banner of a ``LobbyingFirm``
      but always on behalf of a client, to sway the
      opinion of or gain influence from an
      ``ExecutiveOfficial``. '''
