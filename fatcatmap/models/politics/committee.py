# -*- coding: utf-8 -*-

'''

  fcm: political committee models

'''

# graph models
from .. import (Vertex,
                describe)
from ..abstract import Name
from ..abstract.org import OrganizationName




@describe(type=OrganizationName)
class PoliticalCommitteeName(OrganizationName):

  ''' '''


@describe(root=True)
class PoliticalCommittee(Vertex):

  '''  '''

  name = PoliticalCommitteeName, {'indexed': True, 'required': True, 'embedded': True}

