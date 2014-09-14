# -*- coding: utf-8 -*-

'''

  fcm: commercial business models

'''

# graph models
from .. import (Vertex,
                describe)

# abstract models
from ..abstract import (Organization,
                        OrganizationName)


@describe(root=True, type=Organization)
class Corporation(Vertex):

  '''  '''

  ## -- personal details -- ##
  name = OrganizationName, {'indexed': True, 'required': True}
