# -*- coding: utf-8 -*-

'''

  fcm: political party models

'''

# graph models
from .. import (Vertex,
                describe)

# abstract models
from ..abstract import OrganizationName


@describe(root=True)
class PoliticalParty(Vertex):

  '''  '''

  name = OrganizationName, {'indexed': True}
