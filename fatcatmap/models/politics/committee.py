# -*- coding: utf-8 -*-

'''

  fcm: political committee models

'''

# graph models
from .. import describe, Vertex
from ..abstract.org import OrganizationName, Organization


@describe(type=OrganizationName)
class PoliticalCommitteeName(OrganizationName):

  ''' '''


@describe(root=True, type=Organization)
class PoliticalCommittee(Vertex):

  '''  '''

  name = PoliticalCommitteeName, {'indexed': True, 'required': True, 'embedded': True}
