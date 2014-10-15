# -*- coding: utf-8 -*-

'''

  fcm: search driver logic

'''

import os
import urllib

# logic
from canteen import logic, bind, core


with core.Library('elasticsearch') as (library, elasticsearch):

  # grab ES client
  from .driver import EsClient


  @bind('search')
  class Search(logic.Logic, EsClient):

    '''  '''

    def __init__(self, *args, **kwargs):

      '''  '''

      super(logic.Logic, self).__init__(*args, **kwargs)

    def name(self, qstr="jo bidn"):

      '''  '''


      return self.search(doc_type='', query_string=qstr,
                  fields=['name.given', 'name.primary', 'name.family'], fuzzy=True)
