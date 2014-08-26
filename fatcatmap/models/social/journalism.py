# -*- coding: utf-8 -*-

'''

  fcm: social issue models

'''

# graph models
from .. import (Vertex,
                describe)

# abstract models
from ..abstract import (Role,
                        Content,
                        TopicName)

# fcm models
from ..person import Person
from ..commercial.business import Corporation


@describe(parent=Corporation, type=Role)
class JournalismFirm(Vertex):

  '''  '''


@describe(parent=Person, type=Role)
class Journalist(Vertex):

  '''  '''


@describe(parent=JournalismFirm, type=Content)
class Publication(Vertex):

  '''  '''
