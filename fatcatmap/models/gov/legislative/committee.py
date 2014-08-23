# -*- coding: utf-8 -*-

'''

    fcm: legislative committee models

'''


# graph models
from fatcatmap.models import Vertex


class LegislativeCommittee(Vertex):

  ''' Represents a logical grouping of legislative actors within a legislative
      body, sometimes responsible for portions of the legislative process. '''

  # -- structure -- #
  id = str, {'indexed': True, 'required': True}
  super = str, {'indexed': True, 'default': None}

  # -- naming / categorization -- #
  type = str, {'indexed': True}
  display = str, {'indexed': True}
  url = str, {'indexed': True, 'default': None}
