# -*- coding: utf-8 -*-

'''

  fcm: search driver logic

'''

import os
import urllib

# logic
from canteen import logic, bind, core
from canteen.core.meta import Proxy

import fatcatmap

# fcm imports
from fatcatmap import models
from fatcatmap.models import BaseVertex


with core.Library('elasticsearch', strict=__debug__) as (library, elasticsearch):

    # load helpers
    from .driver import EsClient
    helpers = library.load('helpers')
    streaming_bulk, bulk = helpers.streaming_bulk, helpers.bulk


    @bind('indexer')
    class Indexer(logic.Logic, EsClient):

      '''  '''

      queue = None
      batch_size = 1000

      def __init__(self, *args, **kwargs):

        super(logic.Logic,self).__init__(*args,**kwargs)

      @staticmethod
      def model_to_es(model):

        ''' converts a model class into an ES mapping schema '''

        pass

      @staticmethod
      def get_models():

        ''' '''

        _models = {name:model for name,model in models.all._entries.iteritems()
                   if not model.__description__.abstract and BaseVertex in model.__bases__}
        return _models

      @staticmethod
      def model_key(entity,full_key=True):

        if full_key:
          return entity.key.flatten(True)[0]
        else:
          if entity.key.parent:
            parent_key = entity.key.parent.flatten(True)[0]
            key = "%s:%s" % (parent_key,entity.key.id)
          else:
            key = ":%s" % entity.key.id
          return key


      def register_models(self,):

        '''

        Called on server startup to generate model mappings
        Only Indexes Vertex types to avoid duplication with embeded models

        '''

        for name,model in self.get_models().iteritems():
          schema = self.model_to_es(model)
          self.create_type(name,props=schema)

      def index_all(self,bulk=True):

        '''  '''

        for name,modelclass in self.get_models().iteritems(): # loop through all vertex classes
          print 'fetching ' + name
          _models = modelclass.query().fetch(limit=0)
          print 'inserting ' + name

          if bulk:
            actions = (self.model_bulk(model) for model in _models)
            stream = streaming_bulk(self.es,actions=actions,chunk_size=30000)
            for s in stream:
              print s

          else:
            for model in _models:
              self.insert(model)

      def model_bulk(self,entity):
        '''
        Takes a model instance and returns a dictionary in elasticsearch bulk format
        '''

        instance = {
          '_index':self.index,
          '_type': entity.__name__,
          '_id': self.model_key(entity)
        }
        instance['_source'] = entity.to_dict()
        return instance


      def delete_index(self):
        self.es.indices.delete(index=self.index)

      def insert(self,entity):
        '''

        Inserts a model into the ES index
        Uses parent key + id as the key, as kind is stored as 'type' in ES
        '''

        data = entity.to_dict()
        key = self.model_key(entity)

        self.es.create(index=self.index,doc_type=entity.__name__,body=data,id=key)



    from canteen.core.meta import Proxy
    instance = Proxy.Component.singleton_map['Indexer']
    fatcatmap.indexer = instance