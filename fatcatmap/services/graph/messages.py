# -*- coding: utf-8 -*-

'''

  fcm: graph messages

'''

# model API
from canteen import model
from canteen import struct


class Filter(model.Model):

  '''  '''

  class FilterType(struct.BidirectionalEnum):

    '''  '''

    KIND = 0x0
    GRAPH = 0x1
    PROPERTY = 0x2
    ANCESTOR = 0x3

  # specs are unschema'd
  # 1) for a `kind` filter, a `spec` should contain a `kind` and `operator`
  # 2) `graph` filters are not yet implemented (@TODO sgammon)
  # 3) `property` filters should contain an `property`, `operator` and potentially a `value`
  # 4) `ancestor` filters should contain an `operator` and a `value`

  type = FilterType, {'default': FilterType.KIND}
  spec = dict, {'repeated': True}


class GraphObject(model.Model):

  '''  '''

  data = dict
  cached = bool


class Scorer(model.Model):

  '''  '''


class GraphRequest(model.Model):

  '''  '''

  class Options(model.Model):

    '''  '''

    depth = int, {'default': 2}
    limit = int, {'default': 5}
    cached = bool, {'default': True}
    keys_only = bool, {'default': True}
    descriptors = bool, {'default': False}
    collections = bool, {'default': False}
    indexes = bool, {'default': True}

  # -- base -- #
  origin = str, {'default': None}
  session = str, {'default': None}

  # -- options -- #
  filters = Filter, {'repeated': True, 'embedded': True}
  scoring = Scorer, {'repeated': True, 'embedded': True}
  options = Options, {'required': False, 'embedded': True}


class Meta(model.Model):

  '''  '''

  kinds = str, {'repeated': True}
  counts = int, {'repeated': True}
  cached = bool, {'default': False}
  options = dict, {'required': True}
  fragment = str, {'required': True}


class Data(model.Model):

  '''  '''

  keys = str, {'repeated': True}
  indexes = dict, {'required': False}
  objects = GraphObject, {'repeated': True, 'embedded': True}


class Graph(model.Model):

  '''  '''

  origin = int, {'required': True}
  structure = str, {'required': True}
  edges = int, {'required': True}
  vertices = int, {'required': True}


class GraphResponse(model.Model):

  '''  '''

  session = str
  data = Data, {'required': False, 'embedded': True}
  meta = Meta, {'required': True, 'embedded': True}
  graph = Graph, {'required': False, 'embedded': True}
