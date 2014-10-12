# -*- coding: utf-8 -*-

'''

  fcm: abstract organization models

'''

# abstract models
from .name import Name
from .group import (Group,
                    describe,
                    GroupName)

# jurisdiction models
from .jurisdiction import (Jurisdiction,
                           JurisdictionName)


@describe(type=Name)
class OrganizationName(GroupName):

  ''' Describes a name for some officially-endorsed entity, either
      in statute or declaration. '''


@describe(abstract=True)
class Organization(Group):

  ''' Describes an abstract concept of a group made official by some
      legal declaration or statute and recognized as an independent
      and autonomous entity. '''

  name = OrganizationName, {'indexed': True, 'embedded': True}


@describe(abstract=True, type=Organization)
class Institution(Organization):

  ''' Describes an abstract concept of a group made official by statute
      in a body of laws. '''


@describe(abstract=True, type=Jurisdiction)
class Government(Institution):

  ''' Describes an institution charged with overseeing a jurisdiction
      as a governing body, empowered by statute in a body of laws to
      make legal decisions and adjudications. '''

  name = JurisdictionName, {'embedded': True, 'indexed': True}
