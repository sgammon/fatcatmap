# -*- coding: utf-8 -*-

'''

  fcm: abstract seat models

'''

# graph models
from .. import (Model,
                describe)


@describe(abstract=True)
class Seat(Model):

  ''' Describes the abstract concept of a defined and wholly seperate
      "seat" (or known/defined role) that can be occupied by a maximum
      of one ``Person`` at any given time. '''
