# -*- coding: utf-8 -*-

'''

  fcm: external reference descriptor models

'''

# stdlib
import hashlib

# graph models
from .. import (Model,
                describe)

# abstract models
from ..abstract import Token

# canteen
from canteen import model
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

  @classmethod
  def new(cls, parent, provider, name, content):

    ''' Make a new ``ExternalID`` object, from all the required
        parts - a ``provider``, ``name`` for the ID, and of
        course, the ``content`` to store.

        :param parent: Parent object to store ``ExternalID``
          under.

        :param provider: String provider name that carries this
          ``ExternalID`` in their datasets.

        :param name: Name of the ID to be stored.

        :param content: Content of the ID to be stored.

        :returns: Instance of ``ExternalID``, ready to be stored. '''

    # @TODO(sgammon): descriptors are broken
    # @TODO(sgammon): trade MD5 for enum

    keyname = hashlib.md5('::'.join(map(str, (provider, content)))).hexdigest()
    parent = parent.key if isinstance(parent, model.Model) else parent

    return cls(key=model.Key(cls, keyname, parent=parent),
               name=name, provider=provider,
               content=(content,) if not (
                isinstance(content, (list, tuple))) else content)


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
