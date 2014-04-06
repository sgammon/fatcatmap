# -*- coding: utf-8 -*-

'''
  fcm graph logic
'''

# canteen
from canteen import logic
from canteen import model
from canteen import decorators

# models
from fatcatmap.models.graph import edge
from fatcatmap.models.graph import node

# legislative government
from fatcatmap.models.gov import legislative
from fatcatmap.models.gov.legislative import member
from fatcatmap.models.gov.legislative import committee
from fatcatmap.models.gov.legislative import legislator

# judicial government
from fatcatmap.models.gov import judicial

# executive government
from fatcatmap.models.gov import executive


class Graph(model.Model):

  '''  '''

  nodes = node.Node, {'repeated': True}
  edges = edge.Edge, {'repeated': True}
  natives = model.Model, {'repeated': True}


@decorators.bind('graph')
class Grapher(logic.Logic):

  '''  '''

  @decorators.bind('construct')
  def construct(self, origin=None, limit=5, depth=1):

    '''  '''

    if not origin:
      # pick a random legislator
      origin = legislator.Legislator.query(limit=1).fetch()
      if origin: origin = origin[0]

    # pull this legislator's edges

