# -*- coding: utf-8 -*-

'''

  fcm: graph edge models

'''

# stdlib
import datetime

# app model
from fatcatmap.models import AppModel


# Node - represents a node on the Graph.
class Node(AppModel):

  ''' Represents a single Node on the :py:mod:`fatcatmap` graph. '''

  # Node Data
  label = basestring, {'indexed': True, 'required': True, 'verbose_name': 'Label'}
  native = basestring, {'indexed': True, 'required': False, 'verbose_name': 'Native'}
