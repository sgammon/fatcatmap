# -*- coding: utf-8 -*-

'''

  fcm: search service messages

'''

# model
from canteen import model, rpc


class Query(model.Model):

  '''  '''

  term = str


class Result(model.Model):

  '''  '''

  result = model.Key
  score = float


class Results(model.Model):

  '''  '''

  # top-level properties
  count = int, {'default': 0}
  results = Result, {'repeated': True}
