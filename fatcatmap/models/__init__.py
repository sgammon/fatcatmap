# -*- coding: utf-8 -*-

'''

  fcm: models

'''

# canteen model API
from canteen import model


class BaseModel(model.Model):

  ''' Base application model that specifies proper adapter settings. '''

  __adapter__ = "RedisWarehouse"


class Vertex(model.Vertex, BaseModel):

  ''' Extended-functionality graph ``Vertex`` model, with builtin fcm
      functionality and driver support. '''

  # Node Data
  label = basestring, {'indexed': True, 'required': True, 'verbose_name': 'Label'}
  native = basestring, {'indexed': True, 'required': False, 'verbose_name': 'Native'}


class Edge(model.Edge, BaseModel):

  ''' Extended-functionality graph ``Edge`` model, with builtin fcm
      functionality and driver support. '''

  # Edge Data
  label = basestring, {'indexed': True, 'required': False, 'verbose_name': 'Label'}
  node = basestring, {'indexed': True, 'repeated': True, 'verbose_name': 'Nodes'}
  native = basestring, {'indexed': True, 'required': False, 'verbose_name': 'Native'}


__all__ = (
  'graph',
  'gov',
  'finance')
