# -*- coding: utf-8 -*-

'''

  fcm: search driver logic

'''

# canteen
from canteen import core


with core.Library('elasticsearch') as (library, elasticsearch):

    Elasticsearch = library.load('Elasticsearch')


    class EsClient(object):

      '''  '''

      host = {'host': '146.148.67.170', 'port': 9200}

      def __init__(self, index='fcm'):

        '''  '''

        self.index = index
        if not self.index:
          raise

        self.index = index
        self.es = Elasticsearch([self.host])

        try:
          self.create_index(self.index)

        except Exception:
          pass

      def create_index(self, name):

        ''' '''

        self.es.indices.create(index=name)

      def search(self, doc_type, fields=[], query_string=None, fuzzy=True):
        '''
        searches using either the lucene query string syntax
        or a text query with fuzzy matching

        '''

        if query_string:
          if fuzzy:
            body = {
            'query':{
              "fuzzy_like_this" : {
                  "fields" : fields,
                  "like_text" : query_string,
                  "ignore_tf": True,
                  "max_query_terms" : 12}}}
          else:
            body = {
            'query': {
                'query_string': {
                  'default_field': fields[0],  #search all fields under name
                  'default_operator': 'AND', # set to AND for names to work correctly
                  'query': query_string}}}

        res = self.es.search(index=self.index, doc_type=doc_type,
                           body=body)
        return res

      def create_type(self, name, props={}, parent=None):

        '''  '''

        body = {
          name: {
            'properties': props}}

        if parent: body[name]['_parent'] = {'type': parent}
        self.es.indices.put_mapping(index=self.index, doc_type=name, body=body)
