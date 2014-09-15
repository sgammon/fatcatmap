# -*- coding: utf-8 -*-

'''

  fcm: abstract role models

'''

# graph models
from .. import (Key,
                date,
                Model,
                describe)

# abstract models
from .name import Name


@describe(type=Name)
class RoleName(Name):

  ''' Describes a string term assigned to a ``Role`` to distinguish
      it from other roles. A good example would be a person's working
      title - like "Head Lobbyist" or "Senior Senator". '''

  formal = str, {'indexed': True}
  informal = str, {'indexed': True}


@describe(abstract=True)
class Role(Model):

  ''' Describes the abstract concept of a function assumed or part
      played by a person or thing in a particular situation. '''

  start = date, {'indexed': True, 'required': True}
  end = date, {'indexed': True, 'default': None}
  name = RoleName, {'indexed': True, 'default': None}
