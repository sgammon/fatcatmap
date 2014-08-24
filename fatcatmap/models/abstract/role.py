# -*- coding: utf-8 -*-

'''

    fcm: role models

'''

# stdlib
import datetime

# graph models
from fatcatmap.models import Model


class Role(Model):

  '''  '''

  start = datetime.date, {'indexed': True, 'required': True}
  end = datetime.date, {'indexed': True, 'default': None}
