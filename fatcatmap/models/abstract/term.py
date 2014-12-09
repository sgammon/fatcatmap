# -*- coding: utf-8 -*-

'''

  fcm: abstract term models

'''

# base
from .. import (Vertex,
                describe)

# abstract models
from .name import Name
from .seat import Seat
from .event import (Event,
                    describe)


@describe(abstract=True, type=Event)
class Term(Vertex):

  '''  '''

  start = str, {'indexed': True}
  end = str, {'indexed': True}
  seat = Seat, {'embedded': False, 'indexed': True}
