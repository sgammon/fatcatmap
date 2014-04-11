# -*- coding: utf-8 -*-

'''

'''

# model API
from canteen import model
from fatcatmap import models
from fatcatmap.models.graph import node, edge


class NativeObject(model.Model):

  '''  '''

  data = dict, {'required': True}


class GraphRequest(model.Model):

  '''  '''

  origin = basestring
  depth = int, {'default': 1}
  limit = int, {'default': 5}
  natives = bool, {'default': False}


class GraphMeta(model.Model):

  '''  '''

  node_count = int, {'default': 0}
  edge_count = int, {'default': 0}
  native_count = int, {'default': 0}
  node_kinds = basestring, {'repeated': True}
  edge_kinds = basestring, {'repeated': True}
  natives = bool, {'default': True}
  options = dict


class GraphData(model.Model):

  '''  '''

  nodes = node.Node, {'repeated': True}
  edges = edge.Edge, {'repeated': True}
  origin = node.Node, {'required': True}
  natives = NativeObject, {'repeated': True}
  adjacency = dict


class GraphResponse(model.Model):

  '''  '''

  meta = GraphMeta, {'required': True}
  data = GraphData, {'required': False}
