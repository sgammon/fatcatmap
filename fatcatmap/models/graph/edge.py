# -*- coding: utf-8 -*-

'''

  fcm: graph edge models

'''


# stdlib
import datetime

# fatcatmap
from fatcatmap.models import AppModel


# Edge - represents a relationship between two nodes on the Graph.
class Edge(AppModel):

  ''' Represents a single ``Edge`` on the :py:mod:`fatcatmap` graph. '''

  # Edge Data
  label = basestring, {'indexed': True, 'required': False, 'verbose_name': 'Label'}
  node = basestring, {'indexed': True, 'repeated': True, 'verbose_name': 'Nodes'}
  native = basestring, {'indexed': True, 'required': False, 'verbose_name': 'Native'}
