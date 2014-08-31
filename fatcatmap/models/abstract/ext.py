# -*- coding: utf-8 -*-

'''

    fcm: external ID models

'''

# graph models
from .. import describe, Model


@describe(descriptor=True)
class ExternalID(Model):

  '''  '''

  ## -- ID content -- ##
  content = str, {'indexed': True, 'repeated': True}

  ## -- ID structure -- ##
  name = str, {'indexed': True, 'required': True}
  provider = str, {'indexed': True, 'required': True}


@describe(descriptor=True)
class URI(Model):

  '''  '''

  ## -- content -- ##
  location = str, {'indexed': True, 'repeated': True}
  content = str, {'indexed': False, 'compressed': True}
