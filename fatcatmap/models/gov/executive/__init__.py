# -*- coding: utf-8 -*-

'''

  fcm: executive models

'''

# graph models
from fatcatmap.models import Vertex


class ExecutiveOfficial(Vertex):

  ''' Represents an official elected or appointed to office within an executive
      branch of government, past or present. '''

  # -- primary naming -- #
  firstname = str, {'indexed': True}
  lastname = str, {'indexed': True}
