# -*- coding: utf-8 -*-

'''

  fcm: grapher

'''

# local
from .graph import Graph
from .options import GraphOptions

# canteen
from canteen import model, logic, decorators

# models
from fatcatmap.models.graph import node, edge


@decorators.bind('graph')
class Grapher(logic.Logic):

  '''  '''

  def _default_origin(self):

    '''  '''

    # @TODO(sgammon): make this not suck
    return node.Node.get(model.Key(urlsafe="Ok5vZGU6QzAwMTQ3MTcz"))

  ## == Public == ##
  @decorators.bind('open')
  def open(self, origin=None, fulfill=True, **options):

    '''  '''

    # construct graph and start yielding
    with Graph(origin or self._default_origin(), options=GraphOptions(**options)) as session:
      for artifact in session.build(fulfill=fulfill, iter=True):
        yield artifact
      yield session

  @decorators.bind('construct')
  def construct(self, origin=None, fulfill=True, **options):

    '''  '''

    # construct graph
    return Graph(origin or self._default_origin(), options=GraphOptions(**options)).build(fulfill=fulfill, iter=False)


__all__ = (
  'Graph',
  'Grapher',
  'GraphOptions'
)
