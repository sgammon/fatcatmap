# -*- coding: utf-8 -*-

'''

  fcm: graph service

'''

# messages and RPC
from . import messages
from canteen import remote, Service, model

# models
from fatcatmap.models.graph import node


@remote.service('graph')
class GraphService(Service):

  ''' '''

  @remote.method(messages.GraphRequest, messages.CompiledGraph)
  def construct(self, request):

    ''' '''

    origin = (request.origin and node.Node.get(model.Key(urlsafe=request.origin))) or None

    # construct graph
    meta, data, graph = self.graph.construct(origin, **{
      'fulfill': (request.options.natives or True) if request.options else True,
      'depth': (request.options.depth or 1) if request.options else 1,
      'limit': (request.options.limit or 5) if request.options else 5
    }).extract(flatten=True)

    # then optionally fulfill, then extract
    return messages.CompiledGraph(**{
      'meta': messages.Metadata(**meta).to_message(),
      'data': messages.RawData(**data).to_message(),
      'graph': messages.GraphData(**graph).to_message()
    }).to_message()
