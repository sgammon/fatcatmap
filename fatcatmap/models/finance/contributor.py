# -*- coding: utf-8 -*-

'''

    fatcatmap finance models: contributors

    :author: Alexander Rosner <alex@momentum.io>
    :copyright: (c) momentum labs, 2013
   
'''

# canteen models
from canteen import model
from fatcatmap.models import AppModel

class Contributor(AppModel):

  ''' Represents a Contributor from the :py:mod:`fatcatmap`graph. '''

  name = basestring, {'indexed': True}
  contributor_type = basestring, {'indexed': True}
  fec_category = basestring, {'indexed': True}
  open_secrets_id = basestring, {'indexed': True}
  freebase_id = basestring, {'indexed': True}
