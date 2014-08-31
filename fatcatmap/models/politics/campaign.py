# -*- coding: utf-8 -*-

'''

  fcm: political campaign models

'''

# graph models
from .. import (Vertex,
                describe)

# fcm models
from ..person import Person
from .election import Election
from ..social.issues import Issue

# abstract models
from ..abstract import OrganizationName


@describe(root=True)
class Campaign(Vertex):

  '''  '''

  name = OrganizationName, {'indexed': True}


@describe(root=True)
class IssueCampaign(Campaign):

  '''  '''

  subject = Issue, {'indexed': True, 'required': True}


@describe(parent=Person)
class CandidateCampaign(Campaign):

  '''  '''

  subject = Person, {'indexed': True, 'required': True}
  election = Election, {'indexed': True, 'required': True}
