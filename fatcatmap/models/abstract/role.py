# -*- coding: utf-8 -*-

'''

    fcm: role models

'''

# graph models
from .. import date, Key, Model


class Role(Model):

  '''  '''

  start = date, {'indexed': True, 'required': True}
  end = date, {'indexed': True, 'default': None}
  peers = Key, {'indexed': True, 'repeated': True}
