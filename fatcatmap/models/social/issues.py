# -*- coding: utf-8 -*-

'''

    fcm: issue models

'''

# graph models
from fatcatmap.models import Vertex
from fatcatmap.models import abstract
from fatcatmap.models import describe


@describe(root=True)
class Issue(Vertex):

  '''  '''

  name = abstract.TopicName, {'indexed': True}
