# -*- coding: utf-8 -*-

'''

  fcm: data warehouse logic

'''

# local
from . import adapter

# fcm
from fatcatmap.models import Edge
from fatcatmap.models import Vertex
from fatcatmap.logic import grapher
from fatcatmap.models.graph import hint
from fatcatmap.models.graph import graph

# canteen
from canteen import struct
from canteen import decorators, Logic


@decorators.bind('db')
class DataWarehouse(Logic):

  '''  '''

  # bind models
  models = struct.ObjectProxy({
    'hint': hint.Hint,
    'node': Vertex,
    'edge': Edge
  })

  @property
  def adapter(self):

    '''  '''

    # TODO(sgammon): support for non-metal systems
    return adapter.RedisWarehouse()

  ## +=+=+ Util Methods +=+=+ ##
  def options(self, depth=graph.DEFAULT_DEPTH, limit=graph.DEFAULT_LIMIT):

    '''  '''

    return grapher.GraphOptions(depth=depth, limit=limit)

  def graph(self, origin, **options):

    '''  '''

    return grapher.Graph(origin, self.options(**options))
