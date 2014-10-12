# -*- coding: utf-8 -*-

'''

  fcm: commercial industry models

'''

# graph models
from .. import (Key,
                Vertex,
                describe)

# abstract models
from ..abstract import Name


@describe(type=Name)
class IndustryName(Name):

  ''' Describes a ``Name`` as used when describing an ``Industry``,
      which is defined as a particular form or branch of economic
      or commercial activity. '''


@describe(root=True)
class Industry(Vertex):

  ''' Describes an activity or domain in which a great deal of time
      or effort is expended, or a particular form or branch of
      economic activity. '''

  ## -- corporate details -- ##
  name = IndustryName, {'indexed': True, 'required': True, 'embedded': True}
  super = Key, {'indexed': True, 'default': None}  # super-industry
