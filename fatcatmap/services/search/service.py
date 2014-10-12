# -*- coding: utf-8 -*-

'''

  fcm: search service

'''

# local
from . import messages
from . import exceptions

# services
from canteen import model, rpc
from canteen.rpc import remote, Service


@remote.service('search')
class SearchAPI(Service):

  '''  '''

  exceptions = rpc.Exceptions({
    "invalid_query": exceptions.InvalidQuery,
    "es_is_down": exceptions.ElasticsearchDown})

  @remote.method(messages.Query, messages.Results)
  def query(self, request):

    '''  '''



    if not isinstance(request.term, basestring):
      raise self.exceptions.invalid_query("Term must be a string")

    try:
      res = self.search.name(request.term)
      hits = res['hits'].get('hits', [])
      msgs = []

      for hit in hits:
        msg = {'result': model.Key.from_raw(hit['_id']),
                  'score': hit['_score']}
        name = hit['_source'].get('name')
        if name:
          msg['label'] = name.get('primary')
        msgs.append(messages.Result(**msg).to_message())

      return messages.Results(count=res['hits']['total'], results=msgs)

    except RuntimeError:
      raise self.exceptions.es_is_down("Search is disabled right now")
