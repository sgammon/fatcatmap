# -*- coding: utf-8 -*-

'''

    fatcatmap legislative models: committee
    :author: Alexander Rosner <alex@momentum.io>
    :copyright: (c) momentum labs, 2013
   
'''

# canteen models
from canteen import model
from fatcatmap.models import AppModel

class Recipient(AppModel):
    
    ''' Represents a Recipient from the :py:mod:`fatcatmap`graph. '''

    name = basestring, {'indexed': True}
    open_secrets_id = basestring, {'indexed': True}
    freebase_id = basestring, {'indexed':True}
