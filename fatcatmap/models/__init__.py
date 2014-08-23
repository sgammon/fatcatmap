# -*- coding: utf-8 -*-

'''

    fatcatmap models
    :author: Alexander Rosner <alex@momentum.io>
    :copyright: (c) momentum labs, 2013

'''

# canteen model API
from canteen import model


class AppModel(model.Model):

  ''' Application model that specifies proper adapter settings. '''

  __adapter__ = "RedisWarehouse"


__all__ = (
  'graph',
  'gov',
  'finance')
