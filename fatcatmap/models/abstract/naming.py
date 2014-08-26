# -*- coding: utf-8 -*-

'''

    fcm: naming models

'''

# graph models
from .. import (Model,
                describe)


class Name(Model):

  '''  '''

  primary = str, {'indexed': True}
  secondary = str, {'indexed': True, 'repeated': True}


@describe(type=Name)
class PersonName(Name):

  '''  '''

  ## -- basic naming -- ##
  given = str, {'indexed': True}
  family = str, {'indexed': True}

  ## -- extra naming -- ##
  prefix = str, {'indexed': True, 'repeated': True}
  postfix = str, {'indexed': True, 'repeated': True}
  nickname = str, {'indexed': True, 'repeated': True}


@describe(type=Name)
class PlaceName(Name):

  '''  '''


@describe(type=Name)
class RoleName(Name):

  '''  '''

  formal = str, {'indexed': True}
  informal = str, {'indexed': True}


@describe(type=Name)
class TopicName(Name):

  '''  '''


@describe(type=Name)
class IndustryName(Name):

  '''  '''


@describe(type=Name)
class OrganizationName(Name):

  '''  '''

  ## -- basic naming -- ##
  formal = str, {'indexed': True, 'repeated': True}
  informal = str, {'indexed': True, 'repeated': True}
  dba = str, {'indexed': True, 'repeated': True}
