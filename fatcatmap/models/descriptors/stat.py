# -*- coding: utf-8 -*-

'''

  fcm: external reference descriptor models

'''

# graph models
from .. import (Model,
                describe)

# abstract models
from ..abstract import (Stat,
                        EdgeStat,
                        VertexStat)


@describe(descriptor=True, type=Stat)
class RankedStatValue(Model):

  ''' Describes a statistic structure that carries a value, along with
      a globally-calculated rank and ordinal position. '''

  # value of actual stat
  value = (int, float), {'indexed': True}

  # rank and ordinal position of stat globally
  rank = float, {'indexed': True}
  ordinal = int, {'indexed': True}


@describe(descriptor=True, type=Stat)
class CategoricalStatValue(RankedStatValue):

  ''' Describes a statistic that builds upon ``RankedStatValue`` to
      provide categorical comparison along with global rank and
      ordinal. '''

  # global 1st, always
  rank = float, {'indexed': True, 'repeated': True}
  ordinal = int, {'indexed': True, 'repeated': True}

  # category is repeated string of nested categories
  category = str, {'indexed': True, 'repeated': True}
