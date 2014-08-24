# -*- coding: utf-8 -*-

'''

    fcm: campaign models

'''

# graph models
from .. import Vertex
from .. import abstract
from .. import describe

# fatcatmap models
from .issues import Issue
from .politics import Election
from ..person import Person


@describe(root=True)
class Campaign(Vertex):

  '''  '''

  name = abstract.OrganizationName, {'indexed': True}


class IssueCampaign(Campaign):

  '''  '''

  subject = Issue, {'indexed': True, 'required': True}


class CandidateCampaign(Campaign):

  '''  '''

  subject = Person, {'indexed': True, 'required': True}
  election = Election, {'indexed': True, 'required': True}
