# -*- coding: utf-8 -*-

'''

  fcm: abstract group models

'''

# graph models
from .. import (Vertex,
                describe)

# abstract models
from .name import Name


@describe(type=Name)
class GroupName(Name):

  ''' Describes a name for some officially-endorsed entity, either
      in statute or declaration. '''

  formal = str, {'indexed': True}
  informal = str, {'indexed': True, 'repeated': True}


@describe(abstract=True)
class Group(Vertex):

  ''' Abstractly describes the concept of a group of things,
      collected or brought together by some common attribute. '''

  name = GroupName, {'indexed': True, 'embedded': True}


@describe(type=Name)
class FactionName(GroupName):

  ''' Describes a name for a group of pepole or organizations
      united behind an issue or ideology. '''

  plural = str, {'indexed': True}
  singular = str, {'indexed': True}


@describe(abstract=True, type=Group)
class Faction(Group):

  ''' Abstractly describes the concept of a group of people
      or organizations, united behind an issue or ideology. '''

  name = FactionName, {'indexed': True, 'embedded': True}
