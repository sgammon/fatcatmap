# -*- coding: utf-8 -*-

'''

    fcm: organization models

'''

# abstract models
from .group import describe, Group


@describe(abstract=True)
class Organization(Group):

  '''  '''


@describe
class Institution(Organization):

  '''  '''


@describe
class Government(Organization):

  '''  '''
