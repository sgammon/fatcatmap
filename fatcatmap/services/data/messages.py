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

  encoded = str, {'required': True}
  timestamp = datetime, {'required': False}


class Keyset(model.Model):

  ''' Specifies a bag of keys. '''

  fragment = str, {'required': True}
  data = KeyTimestampPair, {'repeated': True, 'embedded': True}


class Datapoint(model.Model):

  ''' Specifies an item attached to a ``DataResponse`` that
      contains an object or value resulting from a request
      for data that the server has attempted to satisfy. '''

  key = str, {'required': True}
  data = dict, {'required': False}
  cached = bool


class FetchOptions(model.Model):

  ''' Specifies options for methods that provide access
      to data. '''

  ignore = str, {'repeated': True}
  cached = bool, {'default': True}
  collections = bool, {'default': False}


class FetchRequest(model.Model):

  ''' Specifies a request for access to raw data. '''

  session = str
  keys = str, {'repeated': True}
  held = Keyset, {'required': False, 'embedded': True}
  options = FetchOptions, {'required': False, 'embedded': True}


class FetchResponse(model.Model):

  ''' Specifies a response to a request for access to
      raw data. '''

  session = str
  count = int, {'default': 0}
  errors = int, {'default': 0}
  content = Datapoint, {'repeated': True}
