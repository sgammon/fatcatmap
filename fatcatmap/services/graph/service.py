# -*- coding: utf-8 -*-

'''

  fcm: graph service

'''

# messages and RPC
from . import messages, exceptions
from canteen import rpc, remote, Service, model

# models
from fatcatmap.models import Vertex


@remote.service('graph')
class GraphService(Service):

  ''' Provides an API service to retrieve graph structures,
      given an origin node (or ``None``, which resolves a)
      good node to start from) and a set of options to guide
      the query/traversal process. '''

  exceptions = rpc.Exceptions(**{})

  @remote.method(messages.GraphRequest, messages.GraphResponse)
  def construct(self, request):

    ''' Construct a graph structure, by reading from available
        data sources (potentially caches) to discover vertex
        neighbors linked by edges and report them in an
        efficient way to the caller.

        :param request: Always an instance of
          :py:class:`messages.GraphRequest`.

        :returns: Always an instance of
          :py:class:`messages.GraphResponse`. '''

    # convert origin to key
    origin = (
      request.origin and model.Key.from_urlsafe(request.origin)) or request.origin

    # construct graph
    return self.graph.construct(None, origin, **{
      'depth': (request.options and request.options.depth) or self.graph.options.defaults['depth'],
      'limit': (request.options and request.options.limit) or self.graph.options.defaults['limit'],
      'keys_only': (request.options.keys_only if request.options is not None else self.graph.options.defaults['keys_only']),
      'collections': (request.options.collections if request.options is not None else self.graph.options.defaults['collections'])})
