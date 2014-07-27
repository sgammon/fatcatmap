# -*- coding: utf-8 -*-

'''

  fcm: graph hint models

'''

# canteen
from canteen import model

# app model
from fatcatmap.models import AppModel


## Constants
DEFAULT_DEPTH = 1  # only map to 1-traversal out by default
DEFAULT_LIMIT = 15  # limit edge count per traversal step


class GraphOptions(AppModel):

  '''  '''

  depth = int, {'default': DEFAULT_DEPTH}
  limit = int, {'default': DEFAULT_LIMIT}


class Graph(AppModel):

  '''  '''

  data = model.Key, {'repeated': True}
  structure = model.Key, {'repeated': True}
  origin = model.Key, {'required': True}
  options = GraphOptions, {'default': GraphOptions()}
