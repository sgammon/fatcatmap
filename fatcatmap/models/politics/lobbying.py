# -*- coding: utf-8 -*-

'''

  fcm: political lobbying models

'''

# graph models
from .. import (Vertex,
                describe)

# abstract models
from ..abstract import (Role,
						Contract)

# fcm models
from ..person import Person
from ..commercial.business import Corporation


## +=+=+=+=+=+=+=+=+ Vertexes +=+=+=+=+=+=+=+=+ ##

@describe(parent=Corporation, type=Role)
class LobbyingFirm(Corporation):

  '''  '''


@describe(parent=Person, type=Role)
class Lobbyist(Vertex):

  '''  '''

  firm = LobbyingFirm, {'indexed': True, 'default': None, 'embedded': False}


## +=+=+=+=+=+=+=+=+ Edges +=+=+=+=+=+=+=+=+ ##

@describe(type=Contract)
class Retains(Corporation >> LobbyingFirm):

  '''  '''

  pass
