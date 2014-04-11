# -*- coding: utf-8 -*-

'''

  fcm: graph service

'''

# messages and RPC
from . import messages
from canteen import remote, Service


@remote.public('graph')
class GraphService(Service):

  ''' '''

  @remote.public(messages.GraphRequest, messages.GraphResponse)
  def construct(self, request):

    ''' '''

    # construct graph, then optionally fulfill, then extract
    meta, data = self.graph.construct(request.origin, **{
      'fulfill': request.natives or True,
      'depth': request.depth or 1,
      'limit': request.limit or 5
    }).to_struct()

    # serialize response
    return messages.GraphResponse(**{

      'meta': messages.GraphMeta(**meta).to_message(),
      'data': messages.GraphData(**{
        'nodes': [node.to_message() for node in data['nodes']],
        'edges': [edge.to_message() for edge in data['edges']],
        'natives': [messages.NativeObject(
          data=native.to_message()
        ).to_message() for native in data['natives']],
        'origin': data['origin'].to_message(),
        'adjacency': data['adjacency']
      }).to_message()

    })
