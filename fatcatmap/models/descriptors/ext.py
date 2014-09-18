# -*- coding: utf-8 -*-

'''

  fcm: external reference descriptor models

'''

# graph models
from .. import (Model,
                describe)

# abstract models
from ..abstract import Token

# struct
from canteen.util import struct


@describe(descriptor=True, type=Token)
class ExternalID(Model):

  ''' Describes a token from an external system that references
      an object held by catnip, such that it can be considered
      a foreign representation of the same thing. '''

  ## -- ID content -- ##
  content = str, {'indexed': True, 'repeated': True}

  ## -- ID structure -- ##
  name = str, {'indexed': True, 'required': True}
  provider = str, {'indexed': True, 'required': True}


@describe(descriptor=True, type=Token)
class URI(Model):

  ''' Describes a token consisting of a URI that represents an
      object held by catnip, such that it is claimed by that
      entity as an owned web presence or referenced as a foreign
      representation of the same thing. '''

  class Protocols(struct.BidirectionalEnum):

    ''' Enumerates protocols that a URI may be marked as being
        accessible over. '''

    GS = 0x0  # Google Cloud Storage
    FTP = 0x1  # File Transfer Protocol
    HTTP = 0x2  # Hypertext Transfer Protocol
    HTTPS = 0x3  # HTTP, wrapped by TLS/SSL

  ## -- content -- ##
  protocol = Protocols, {'indexed': True, 'repeated': True}
  location = str, {'indexed': True, 'repeated': True}
  content = str, {'indexed': False, 'compressed': True}

  # @TODO(sgammon): break out web content into its own structure
