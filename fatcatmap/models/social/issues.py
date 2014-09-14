# -*- coding: utf-8 -*-

'''

  fcm: social issue models

'''

# graph models
from .. import (Key,
				Vertex,
                describe)

# abstract models
from ..abstract import TopicName


@describe(root=True)
class Issue(Vertex):

  ''' Represents a social issue (like 'healthcare' or
  	  'national security') about which legislation is
  	  authored and targeted by lobbying. '''

  general = Key, {'indexed': True}
  specific = Key, {'indexed': True}
  name = TopicName, {'indexed': True, 'embedded': True}
