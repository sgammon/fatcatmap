# -*- coding: utf-8 -*-

'''

  fcm: commercial industry models

'''

# graph models
from .. import (Vertex,
                describe)

# abstract models
from ..abstract import IndustryName


@describe(root=True)
class CommercialIndustry(Vertex):

  '''  '''

  ## -- corporate details -- ##
  name = IndustryName, {'indexed': True, 'required': True}
