# -*- coding: utf-8 -*-

'''

'''

# model API
from canteen import model


class GraphRequest(model.Model):

  '''  '''

  class Options(model.Model):

    '''  '''

    depth = int, {'default': 1}
    limit = int, {'default': 5}
    indexes = bool, {'default': True}
    natives = bool, {'default': True}

  origin = basestring
  options = Options


class Metadata(model.Model):

  '''  '''

  kinds = dict
  counts = int, {'repeated': True}
  errors = int, {'repeated': True}
  natives = bool, {'default': True}
  options = dict


class RawData(model.Model):

  '''  '''

  keys = basestring, {'repeated': True}
  objects = dict
  index = dict


class GraphData(model.Model):

  '''  '''

  nodes = int, {'repeated': True}
  edges = int, {'repeated': True}
  origin = int, {'required': True}
  natives = int, {'repeated': True}
  origin = int


class CompiledGraph(model.Model):

  '''  '''

  data = RawData, {'required': False}
  meta = Metadata, {'required': True}
  graph = GraphData, {'required': False}
