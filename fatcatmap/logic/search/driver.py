# -*- coding: utf-8 -*-

'''

  fcm: search driver logic

'''

from fatcatmap import config
from elasticsearch import Elasticsearch
from elasticsearch.helpers import streaming_bulk, bulk




class EsClient(object):

  host = {'host':'162.222.178.107', 'port': 9200}


  def __init__(self,index='fcm'):

    self.index = index
    if not self.index:
      raise

    self.index = index
    self.es = Elasticsearch([self.host])

    try:
      self.create_index(self.index)
    except:
      pass

  def create_index(self,name):

    ''' '''

    self.es.indices.create(index=name)



  def create_type(self,name,props={},parent=None):

    '''  '''

    body = {
      name: {
        'properties': props
      }
    }
    if parent:
      body[name]['_parent'] = {'type':parent}

    self.es.indices.put_mapping(index=self.index,doc_type=name,body=body)








