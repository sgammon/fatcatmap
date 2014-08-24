# -*- coding: utf-8 -*-

'''

    fcm: naming models

'''

# graph models
from fatcatmap.models import Model


class Name(Model):

  '''  '''

  primary = str, {'indexed': True}

  @property
  def kind(self):

    ''' return kind name that should be used in storage '''

    return 'Name'


class PersonName(Name):

  '''  '''

  ## -- basic naming -- ##
  given = str, {'indexed': True}
  family = str, {'indexed': True}

  ## -- extra naming -- ##
  prefix = str, {'indexed': True, 'repeated': True}
  postfix = str, {'indexed': True, 'repeated': True}
  nickname = str, {'indexed': True, 'repeated': True}


class PlaceName(Name):

  '''  '''


class OrganizationName(Name):

  '''  '''

  ## -- basic naming -- ##
  formal = str, {'indexed': True, 'repeated': True}
  informal = str, {'indexed': True, 'repeated': True}
  dba = str, {'indexed': True, 'repeated': True}
