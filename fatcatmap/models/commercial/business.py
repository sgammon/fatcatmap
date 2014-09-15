# -*- coding: utf-8 -*-

'''

  fcm: commercial business models

'''

# graph models
from .. import (Vertex,
                describe)

# address models
from ..address import Address

# abstract models
from ..abstract import (Place,
                        Organization,
                        OrganizationName)


@describe(root=True, type=Organization)
class Corporation(Vertex):

  '''  '''

  ## -- personal details -- ##
  name = OrganizationName, {'indexed': True, 'required': True, 'embedded': True}


@describe(parent=Corporation, type=Place)
class CorporateOffice(Vertex):

  '''  '''

  address = Address, {'embedded': True, 'indexed': True, 'required': True}
  headquarters = bool, {'indexed': True, 'default': False}
