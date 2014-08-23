# -*- coding: utf-8 -*-

'''

    fatcatmap legislative models: committee
    :author: Alexander Rosner <alex@momentum.io>, Ian Weisberger <ian@momentum.io>
    :copyright: (c) momentum labs, 2014
   
'''

# canteen models
from canteen import model
from fatcatmap.models import AppModel

class Recipient(AppModel):
    
    ''' Represents a Recipient from the :py:mod:`fatcatmap`graph. '''

    name = basestring, {'indexed': True}
    open_secrets_id = basestring, {'indexed': True}
    freebase_id = basestring, {'indexed':True}


class RecipientStats(AppModel):
  ''' represents
  '''
  recipient_id = basestring, {} # opensecrets id of recipient
  amount = int, {}
  count = int, {}
  amount_rank = float, {}
  count_rank = float, {}



class RecipientCategoryStats(AppModel):

  ''' Represents a summarized record of statistics pertaining to contributions
      for a specifc category
  '''

  recipient_id = basestring, {} # opensecrets id of recipient

  contributor_category_id = basestring, {}


  #numeric fields
  amount = int, {}
  count = int, {}
  # percentile fields
  amount_rank = float, {}
  amount_category_rank = float,{}
  count_rank = float, {}
  count_category_rank = float, {}