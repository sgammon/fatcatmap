# -*- coding: utf-8 -*-

'''

    fcm: event models

'''

# graph models
import datetime
from .. import describe, Model


@describe(abstract=True)
class Event(Model):

  ''' Specifies an action that occurred at a specific (or
      vague) single moment in time. '''

  occurred = datetime.datetime, {'indexed': True}
