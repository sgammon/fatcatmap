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

    depth = int
    limit = int
    cached = bool
    keys_only = bool
    descriptors = bool
    collections = bool

  # -- base -- #
  origin = str
  session = str

  # -- options -- #
  filters = Filter, {'repeated': True, 'embedded': True}
  scoring = Scorer, {'repeated': True, 'embedded': True}
  options = Options, {'required': False, 'embedded': True}


class Meta(model.Model):

  ''' Specifies a container for metadata describing the
      resulting ``Graph`` structure. '''

  fragment = str

  # -- sets --
  kinds = str, {'repeated': True}
  counts = int, {'repeated': True}

  # -- flags --
  cached = bool
  options = dict


class Data(model.Model):

  ''' Specifies a container for raw data, to be used on
      outgoing responses to ``GraphRequest``s. '''

  keys = str, {'repeated': True}
  objects = GraphObject, {'repeated': True, 'embedded': True}


class GraphResponse(model.Model):

  ''' Specifies a response to a ``GraphRequest``, including
      metadata, raw data, and graph structure. '''

  origin = int, {'required': True}
  session = str, {'indexed': False}
  data = Data, {'required': False, 'embedded': True, 'indexed': False}
  meta = Meta, {'required': True, 'embedded': True, 'indexed': False}
