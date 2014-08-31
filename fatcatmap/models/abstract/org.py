# -*- coding: utf-8 -*-

'''

    fcm: organization models

'''

# abstract models
from .group import describe, Group


@describe(abstract=True)
class Organization(Group):

  '''  '''


class Institution(Organization):

  '''  '''


class Corporation(Organization):

  '''  '''


class Government(Organization):

  '''  '''
