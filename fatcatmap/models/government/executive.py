# -*- coding: utf-8 -*-

'''

  fcm: executive government models

'''

# fcm models
from .. import Vertex
from .. import describe
from ..person import Person
from ..abstract import Role
from ..abstract import Seat


@describe(type=Seat)
class ExecutiveOffice(Vertex):

  '''  '''


@describe(parent=Person, type=Role)
class ExecutiveOfficer(Vertex):

  '''  '''

  seat = ExecutiveOffice, {'embedded': True, 'indexed': True}
