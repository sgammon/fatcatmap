# -*- coding: utf-8 -*-

'''

  fcm: abstract stat models

'''

# canteen
from canteen import model

# graph models
from .. import (Edge,
                Model,
                Vertex,
                describe)


@describe(abstract=True)
class Stat(Model):

  ''' Describes the abstract concept of a calculated statistic attached
      to some other entity after analysis. '''


@describe(abstract=True, parent=Edge)
class EdgeStat(Stat):

  ''' Describes the concept of a statistic descriptor that is applied to
      an ``Edge`` object. '''


@describe(abstract=True, parent=Vertex)
class VertexStat(Stat):

  ''' Describes the concept of a statistic descriptor that is applied to
      a ``Vertex`` object. '''
