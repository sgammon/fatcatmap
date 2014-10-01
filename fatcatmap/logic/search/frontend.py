# -*- coding: utf-8 -*-

'''

  fcm: search driver logic

'''

import os
import urllib
from .driver import EsClient

# logic
from canteen import logic, bind


@bind('search')
class Search(logic.Logic, EsClient):

  '''  '''

  def __init__(self, *args, **kwargs):

    '''  '''

    super(logic.Logic, self).__init__(*args, **kwargs)

  def name(self, qstr="jo bidn"):

    '''  '''


    return self.search(doc_type='', query_string=qstr,
                fields=['name.given','name.primary','name.family'], fuzzy=True)

