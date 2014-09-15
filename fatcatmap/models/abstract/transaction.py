# -*- coding: utf-8 -*-

'''

  fcm: abstract transaction models

'''

# graph models
from .. import Edge

# event models
from .event import (Event,
                    datetime,
                    describe)


@describe(abstract=True)
class Agreement(Event):

  ''' Describes the abstract concept of two parties coming to
      an agreement on a discrete topic, task, or binding
      decision. '''


@describe(parent=Edge)
class Contract(Agreement):

  ''' Describes the abstract concept of a legally binding
      agreement between two parties on a discrete topic,
      task, or decision. '''

  effective = datetime.date, {'indexed': True}
  ends = datetime.date, {'indexed': True}


@describe(parent=Edge, type=Event)
class Transaction(Agreement):

  ''' Describes a monetary transaction between two parties,
      where one party exchanged money for something from the
      other. '''

  amount = float, {'indexed': True}
