# -*- coding utf-8 -*-

'''

  fcm: graph logic

'''

# local
from .options import Options
from .container import Graph

# canteen
from canteen import bind
from canteen import model
from canteen import logic


@bind('graph')
class Grapher(logic.Logic):

  '''  '''

  caching = False  # graph caching
  options = Options  # attach graph options

  def construct(self, session, origin, export=True, **options):

    '''  '''

    from fatcatmap import models
    from fatcatmap.services.graph import messages as gstruct

    # get options and origin
    options, origin = Options(**options), (
      origin or model.Key.from_urlsafe("OlBlcnNvbjoyMzQ0OkxlZ2lzbGF0b3I6NDAwMjYz"))

    # check cache
    fragment = Graph.fragment(origin, options)
    graph = gstruct.Graph.get(model.Key(gstruct.GraphResponse, fragment),
                              adapter=models.BaseModel.__adapter__)

    if graph and not self.caching: graph.delete()
    elif graph and self.caching: return graph

    # build graph & optionally fulfill
    graph = Graph(models.BaseModel.__adapter__, options=options).traverse(origin)
    if not options.keys_only: graph.fulfill()

    if not export: return graph

    response = self.export(graph, gstruct.GraphResponse)
    response.key = model.Key(gstruct.GraphResponse, fragment)
    if self.caching: response.put(adapter=models.BaseModel.__adapter__)
    return response

  def export(self, graph, message):

    '''  '''

    return
