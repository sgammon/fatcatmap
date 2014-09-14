# -*- coding: utf-8 -*-

'''

  fcm: social issue models

'''

# graph models
from .. import (Vertex,
                describe)

# abstract models
from ..abstract import TopicName


@describe(root=True)
class Issue(Vertex):

  '''  '''

  name = TopicName, {'indexed': True}
