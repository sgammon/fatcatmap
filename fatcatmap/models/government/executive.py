# -*- coding: utf-8 -*-

'''

  fcm: executive government models

'''

# fcm models
from .. import (Vertex,
                describe,
                VertexKey)

# person model
from ..person import Person

# abstract models
from ..abstract import (Role,
                        Seat,
                        Group,
                        Government,
                        Organization,
                        OrganizationName)


@describe(parent=Government, type=Organization)
class ExecutiveAgency(Vertex):

  ''' Describes an organization that is part of executive government and
      logically groups people and resources for a specific task or
      responsibility, such as the Department of Energy or the CIA. '''

  name = OrganizationName, {'embedded': True, 'indexed': True, 'required': True}


@describe(parent=Government, type=Seat)
class ExecutiveOffice(Vertex):

  ''' Describes an appointed or elected executive office in Government, that can
      be occupied by an ``ExecutiveOfficer``. Potentially part of an
      ``ExecutiveAgency`` but could also be above any particular organization,
      like a US President. '''

  type = str, {'indexed': True, 'choices': {'elected', 'appointed'}}
  term = int, {'indexed': True, 'choices': xrange(1, 25), 'default': None}
  max_terms = int, {'indexed': True, 'choices': xrange(2, 10), 'default': None}
  agency = ExecutiveAgency, {'indexed': True, 'embedded': True}


@describe(parent=Person, type=Role)
class ExecutiveOfficer(Vertex):

  ''' Describes a government official that occupies an ``ExecutiveOffice`` for
      an amount of time, either via appointment or election to that office. '''

  reports_to = VertexKey, {'indexed': True}
  seat = ExecutiveOffice, {'embedded': True, 'indexed': True}
