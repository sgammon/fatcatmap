# -*- coding: utf-8 -*-

'''

  fcm: data service messages

'''

# stdlib
from datetime import datetime

# model API
from canteen import model, rpc


class KeyTimestampPair(model.Model):

  ''' Specifies a data structure that carries two items-
      a :py:class:`Key` instance with a timestamp indicating
      when it was last known to be fresh. '''

  encoded = str, {'required': True}  # encoded key
  timestamp = datetime, {'required': False}  # ISO-format datetime


class Keyset(model.Model):

  ''' Specifies a bag of keys. '''

  fragment = str, {'required': True}  # fragment identifier
  data = KeyTimestampPair, {'repeated': True, 'embedded': True}


class DataObject(model.Model):

  ''' Specifies an item attached to a ``DataResponse`` that
      contains an object or value resulting from a request
      for data that the server has attempted to satisfy. '''

  data = dict  # holds data for a single object
  cached = bool  # marked `True` if data was/is cached
  descriptors = dict  # holds `key=>value` pairs from descriptors


class FetchOptions(model.Model):

  ''' Specifies options for methods that provide access
      to data. '''

  cached = bool, {'default': True}  # whether to tolerate cached results
  collections = bool, {'default': False}  # whether to propagate reads to roots


class FetchRequest(model.Model):

  ''' Specifies a request for access to raw data. '''

  session = str  # session identifier
  keys = str, {'repeated': True}  # keys requested
  held = Keyset, {'required': False, 'embedded': True}  # keys held (optional)
  options = FetchOptions, {'required': False, 'embedded': True}  # query/traversal options


class FetchResponse(model.Model):

  ''' Specifies a response to a request for access to
      raw data. '''

  session = str  # session identifier
  count = int, {'default': 0}  # total count of valid data objects
  errors = int, {'default': 0}  # total errors encountered while fetching
  keys = Keyset, {'embedded': True}  # set of keys corresponding to objects
  objects = DataObject, {'repeated': True, 'embedded': True}  # content of data response
