# -*- coding: utf-8 -*-

'''

  fcm: graph messages

'''

# model API
from canteen import rpc
from canteen import model
from canteen import struct


class Filter(model.Model):

  ''' Describes a filter that may be applied to a secondary
      query during graph traversal. '''

  class FilterType(struct.BidirectionalEnum):

    ''' Enumerates available types of filters for ``Filter``
        object, which tune the query and traversal flow. '''

    KIND = 0x0  # describes a filter on an entity's kind
    GRAPH = 0x1  # describes a filter relating to graph traversal
    PROPERTY = 0x2  # describes a filter on a property value
    ANCESTOR = 0x3  # describes a filter based on an entity's key ancestry

  # specs are unschema'd
  # 1) for a `kind` filter, a `spec` should contain a `kind` and `operator`
  # 2) `graph` filters are not yet implemented (@TODO sgammon)
  # 3) `property` filters should contain an `property`, `operator` and potentially a `value`
  # 4) `ancestor` filters should contain an `operator` and a `value`

  type = FilterType, {'default': FilterType.KIND}
  spec = dict, {'repeated': True}


class GraphObject(model.Model):

  ''' Describes a container for a single object, along with
      any necessary metadata that should be stored at the
      object level. '''

  data = dict  # holds data for a single object
  cached = bool  # marked `True` if data was/is cached
  descriptors = dict  # holds `key=>value` pairs from descriptors


class Scorer(model.Model):

  ''' Describes a custom scoring selection, to be used when
      computing edge and node weights. '''


class GraphRequest(model.Model):

  ''' Specifies a structure requesting graph data, along with
      options/queries to guide the traversal and discovery
      process. '''

  class Options(model.Model):

    ''' Describes options that guide, from a high level, the
        traversal and query flow for graph structure. '''

    depth = int, {'default': 2}
    limit = int, {'default': 5}
    cached = bool, {'default': True}
    keys_only = bool, {'default': False}
    descriptors = bool, {'default': True}
    collections = bool, {'default': True}

  # -- base -- #
  origin = str, {'default': None}
  session = str, {'default': None}

  # -- options -- #
  filters = Filter, {'repeated': True, 'embedded': True}
  scoring = Scorer, {'repeated': True, 'embedded': True}
  options = Options, {'required': False, 'embedded': True}


class Meta(model.Model):

  ''' Specifies a container for metadata describing the
      resulting ``Graph`` structure. '''

  kinds = str, {'repeated': True}
  counts = int, {'repeated': True}
  cached = bool, {'default': False}
  options = dict, {'required': True}
  fragment = str, {'required': True}


class Data(model.Model):

  ''' Specifies a container for raw data, to be used on
      outgoing responses to ``GraphRequest``s. '''

  keys = str, {'repeated': True}
  indexes = dict, {'required': False}
  objects = GraphObject, {'repeated': True, 'embedded': True}


class Graph(model.Model):

  ''' Specifies a structure for representing a graph with
      vertices, connected by edges, via a datamodel. '''

  origin = int, {'required': True}
  boundary = int, {'required': True}
  structure = str, {'required': True}


class GraphResponse(model.Model):

  ''' Specifies a response to a ``GraphRequest``, including
      metadata, raw data, and graph structure. '''

  session = str, {'indexed': False}
  data = Data, {'required': False, 'embedded': True, 'indexed': False}
  meta = Meta, {'required': True, 'embedded': True, 'indexed': False}
  graph = Graph, {'required': False, 'embedded': True, 'indexed': False}
