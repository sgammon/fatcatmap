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


class Scorer(model.Model):

  '''  '''


class GraphRequest(model.Model):

  '''  '''

  class Options(model.Model):

    '''  '''

    depth = int, {'default': 1}
    limit = int, {'default': 5}
    cached = bool, {'default': True}
    objects = bool, {'default': True}
    indexes = bool, {'default': True}

  # -- base -- #
  origin = str, {'default': None}
  session = str, {'default': None}

  # -- options -- #
  filters = Filter, {'repeated': True}
  scoring = Scorer, {'repeated': True}
  options = Options, {'required': False}


class Meta(model.Model):

  '''  '''

  kinds = dict, {'required': True}
  counts = int, {'repeated': True}
  errors = int, {'repeated': True}
  cached = bool, {'default': False}
  options = dict, {'required': True}
  fragment = str, {'required': True}


class Data(model.Model):

  '''  '''

  keys = str, {'repeated': True}
  objects = dict, {'required': False}
  indexes = dict, {'required': False}


class Graph(model.Model):

  '''  '''

  origin = int, {'required': True}
  edges = int, {'required': True}
  vertices = int, {'required': True}


class GraphResponse(model.Model):

  '''  '''

  data = Data, {'required': False}
  meta = Meta, {'required': True}
  graph = Graph, {'required': False}
