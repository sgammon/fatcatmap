# -*- coding: utf-8 -*-

'''

  fcm: commercial business models

'''

# graph models
from .. import (Vertex,
                describe)

# enums
from canteen.util import struct

# concrete models
from ..person import Person
from ..address import Address

# abstract models
from ..abstract import (Role,
                        Place,
                        Organization,
                        OrganizationName)


@describe(root=True, type=Organization)
class Corporation(Vertex):

  ''' Describes the concept of a company or group of people authorized
      to act as a single entity and recognized as such in law. '''

  ## -- personal details -- ##
  name = OrganizationName, {'indexed': True, 'required': True, 'embedded': True}
  #industries = 


@describe(parent=Corporation, type=Place)
class CorporateOffice(Vertex):

  ''' Describes a location where a ``Corporation`` maintains an office
      or notable resource. '''

  address = Address, {'embedded': True, 'indexed': True, 'required': True}
  headquarters = bool, {'indexed': True, 'default': False}


@describe(parent=Person, type=Role)
class CorporateOfficer(Role):

  ''' Describes an official role that a ``Person`` may play in a
      company. '''

  class OfficerRole(struct.BidirectionalEnum):

    ''' Describes common roles that a ``Person`` may play as a
        ``CorporateOfficer`` of a ``Corporation``. '''

    SECRETARY = 0x0
    TREASURER = 0x1
    CHIEF_MARKETING = 0x2
    CHIEF_POLICY = 0x3
    CHIEF_FINANCIAL = 0x4
    CHIEF_TECHNICAL = 0x5
    CHIEF_COMPLIANCE = 0x6
    CHIEF_INFORMATION = 0x7
    CHIEF_COUNSEL = 0x8
    VICE_PRESIDENT = 0x9
    PRESIDENT = 0x10
    CHIEF_EXECUTIVE = 0xF

  position = OfficerRole, {'indexed': True, 'repeated': True}


@describe
class Ownership(Vertex >> Corporation):

  ''' Describes a relationship where a ``Person`` or ``Corporation``
      owns some calculable piece of another ``Corporation``. '''

  effective = float, {'indexed': False}


@describe(type=Role)
class BoardMember(Person >> Corporation):

  ''' Describes a ``Person``-based role where they personally sit
      on a ``Corporation``'s managing board. '''

  chair = bool, {'indexed': True, 'default': False}
  senior = bool, {'indexed': True, 'default': False}
