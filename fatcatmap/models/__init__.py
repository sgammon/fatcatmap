# -*- coding: utf-8 -*-

'''

    fatcatmap models
    :author: Alexander Rosner <alex@momentum.io>
    :copyright: (c) momentum labs, 2013

'''


from canteen import model


class AppModel(model.Model):

  ''' Application model that specifies proper adapter settings. '''

  __adapter__ = "RedisAdapter"
  