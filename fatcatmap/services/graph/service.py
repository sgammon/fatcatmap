# -*- coding: utf-8 -*-

'''

  fcm: graph service

'''

# messages and RPC
from . import messages
from canteen import remote, Service, model

# models
from fatcatmap.models import Vertex


@remote.service('graph')
class GraphService(Service):

  ''' '''

  @remote.method(messages.GraphRequest, messages.GraphResponse)
  def construct(self, request):

    ''' '''

    # construct graph
    return (self.graph.construct(None, request.origin, **{
      'depth': (request.options and request.options.depth) or self.graph.options.defaults['depth'],
      'limit': (request.options and request.options.limit) or self.graph.options.defaults['limit'],
      'keys_only': (request.options.keys_only if request.options is not None else self.graph.options.defaults['keys_only']),
      'collections': (request.options.collections if request.options is not None else self.graph.options.defaults['collections'])})
        ).export(messages.GraphResponse)
