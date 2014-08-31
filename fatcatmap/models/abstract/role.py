# -*- coding: utf-8 -*-

'''

    fcm: role models

'''

# graph models
from .. import describe, date, Key, Model


@describe(abstract=True)
class Role(Model):

  '''  '''

  start = date, {'indexed': True, 'required': True}
  end = date, {'indexed': True, 'default': None}
  peers = Key, {'indexed': True, 'repeated': True}
