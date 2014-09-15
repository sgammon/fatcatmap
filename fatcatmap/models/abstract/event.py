# -*- coding: utf-8 -*-

'''

  fcm: abstract event models

'''

# stdlib
from datetime import datetime

# graph models
from .. import (Model,
                describe)


@describe(abstract=True)
class Event(Model):

  ''' Specifies an action that occurred at a specific (or
      vague) single moment in time. '''

  occurred = datetime, {'indexed': True}
