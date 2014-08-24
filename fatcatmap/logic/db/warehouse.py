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

  ''' Provides logic for data warehousing operations, through in-memory or
      Redis-based warehouse implementations. '''

  # bind models
  models = struct.ObjectProxy({
    'hint': hint.Hint,
    'node': Vertex,
    'edge': Edge})

  @property
  def adapter(self):

    ''' Property accessor - factory and return a reference to our in-house
        ``RedisWarehouse`` instance.

        :returns: Instance of :py:class:`adapter.RedisWarehouse`. '''

    # TODO(sgammon): support for non-metal systems
    return adapter.RedisWarehouse()

  ## +=+=+ Util Methods +=+=+ ##
  def options(self, depth=graph.DEFAULT_DEPTH, limit=graph.DEFAULT_LIMIT):

    ''' Spawn a ``GraphOptions`` instance, given ``depth`` and ``limit`` input
        parameters, which govern the recursive depth and inner-step fetch limit,
        respectively.

        :param depth: Limit for recursive steps out from the ``origin`` node
          provided at the beginning of the graphing session.

        :param limit: Limit for edges (sorted by score) pulled at each inner
          step of the graphing process.

        :return: ``GraphOptions`` instance, prepared with the specified
          parameters. '''

    return grapher.GraphOptions(depth=depth, limit=limit)

  def graph(self, origin, **options):

    ''' Begin recursively generating a ``grapher.Graph`` object from the
        specified ``origin``, plus any additional ``options`` to be applied
        to the original ``GraphOptions`` instance.

        :param origin: Origin ``Vertex`` to begin graphing from.

        :param **options: Additional ``GraphOptions`` to overlay before
          continuing graph operations.

        :returns: Assembled ``grapher.Graph`` object. '''

    return grapher.Graph(origin, self.options(**options))
