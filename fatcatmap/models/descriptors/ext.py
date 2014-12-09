# -*- coding: utf-8 -*-

'''

  fcm: external reference descriptor models

'''

# stdlib
import hashlib

# graph models
from .. import (describe,
                Descriptor)

# abstract models
from ..abstract import Token

# canteen
from canteen import model
from canteen.util import struct


@describe(descriptor=True, type=Token)
class ExternalID(Descriptor):

  ''' Describes a token from an external system that references
      an object held by catnip, such that it can be considered
      a foreign representation of the same thing. '''

  __hashfunc__ = hashlib.sha1

  ## -- ID content -- ##
  hash = str, {'indexed': False}
  content = str, {'indexed': True, 'repeated': True}

  ## -- ID structure -- ##
  name = str, {'indexed': False, 'required': True}
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

    if parent is None:
      raise TypeError('Must pass valid Key instance as ExternalID parent.')

    try:
      fingerprint = cls.__hashfunc__('::'.join(map(unicode, (provider, content))).encode('utf-8')).hexdigest()
      parent = parent.key if isinstance(parent, model.Model) else parent
    
    except UnicodeEncodeError:
      import pdb; pdb.set_trace()

    return cls(key=model.Key(cls, '.'.join(('ext', provider, name)), parent=parent),
               name=name, provider=provider,
               hash=fingerprint,
               content=(unicode(content),) if not (
                isinstance(content, (list, tuple))) else unicode(content))


class Protocols(struct.BidirectionalEnum):

  ''' Enumerates protocols that a URI may be marked as being
      accessible over. '''

  GS = 0x0  # Google Cloud Storage
  FTP = 0x1  # File Transfer Protocol
  HTTP = 0x2  # Hypertext Transfer Protocol
  HTTPS = 0x3  # HTTP, wrapped by TLS/SSL


@describe(type=Token, descriptor=True, embedded=True)
class URI(Descriptor):

  ''' Describes a token consisting of a URI that represents an
      object held by catnip, such that it is claimed by that
      entity as an owned web presence or referenced as a foreign
      representation of the same thing. '''

  ## -- content -- ##
  protocol = Protocols, {'indexed': False, 'repeated': True}
  location = str, {'indexed': False, 'repeated': True}
  content = str, {'indexed': False, 'compressed': True}

  # @TODO(sgammon): break out web content into its own structure
