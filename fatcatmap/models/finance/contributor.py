# -*- coding: utf-8 -*-

'''

    fcm: financial contributor models

'''

# graph models
from fatcatmap.models import Vertex


class Contributor(Vertex):

  ''' Represents a Contributor from the :py:mod:`fatcatmap` graph. '''

  # -- naming / categorization -- #
  name = str, {'indexed': True}
  contributor_type = str, {'indexed': True}
  fec_category = str, {'indexed': True}

  # -- external IDs -- #
  open_secrets_id = str, {'indexed': True}
  freebase_id = str, {'indexed': True}
