# -*- coding: utf-8 -*-

'''

  fcm: nonprofit models

'''

# graph models
from .. import describe

# corporation models
from .business import Corporation

# abstract models
from ..abstract import (Organization,
                        OrganizationName)


@describe(root=True, type=Organization)
class Nonprofit(Corporation):

  '''  '''

  ## -- nonprofit details -- ##
  name = OrganizationName, {'embedded': True, 'indexed': True, 'required': True}
