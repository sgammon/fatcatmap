# -*- coding: utf-8 -*-

'''

    fcm: politics models

'''

# graph models
from fatcatmap.models import Vertex
from fatcatmap.models import abstract
from fatcatmap.models import describe


@describe(root=True)
class PoliticalParty(Vertex):

  '''  '''

  name = abstract.OrganizationName, {'indexed': True}


@describe(root=True)
class Election(Vertex):

  '''  '''
