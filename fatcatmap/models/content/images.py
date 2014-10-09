# -*- coding: utf-8 -*-

'''

  fcm: image content models

'''

# canteen
from canteen import struct

# models
from .. import (Key,
                describe)

# descriptor models
from ..descriptors.ext import URI

# content models
from ..abstract.content import Media


## Globals
GSTORAGE = '//storage.googleapis.com/'
FCM_FRONTEND = '//fatcatmap.org/'


@describe(descriptor=True, type=Media)
class Image(URI):

  ''' Describes the basic concept of an image. '''

  content = str, {'indexed': False, 'compressed': False}  # don't compress

  class ImageFormat(struct.BidirectionalEnum):

    ''' Enumerates formats in which an image may be
        available. '''

    GIF = 0x0
    PNG = 0x1
    RAW = 0x2
    JPEG = 0x3
    WEBP = 0x4
    TIFF = 0x5

  class ImageStorage(struct.BidirectionalEnum):

    ''' Eunmerates known storage locations where an
        ``Image`` may be kept by computers. '''

    WAREHOUSE = 0x0  # signifies storage inline in Redis
    EXTERNAL = 0x1  # signifies storage at some external property
    CONTENT = 0x2  # signifies storage in FCM's processed content repositories
    RAW = 0x3  # signifies storage in FCM's raw data repositories
    PROXY = 0x4  # signifies retrieval via FCM's optimized frontend directly

    @staticmethod
    def uri(target, filetype=None):

      ''' Fetch a CDN-style URI that can be used in a
          webpage.

          :param target: ``Image`` object to calculate
            a URI for.

          :param filetype: Filetype to select, if available,
            from the formats specified on ``target``.
            Defaults to ``None`` which makes a sensible
            selection for you.

          :returns: ``unicode`` URI for the ``Image``
            ``object``, usable in a webpage. '''

      provider_prefix = IMAGE_PREFIXES.get(target.storage)

      if provider_prefix is None or not target.formats:
        return target.location  # assumed to be absolute

      if len(target.formats) == 1:  # easy life yo
        return provider_prefix + target.formats[0]

      _winner = None
      for _t in reversed(IMAGE_FORMAT_PRECEDENCE):
        if _t in target.formats: _winner = _t

      # combine with prefix and winning filetype
      return provider_prefix + ('.'.join((
        target.location, IMAGE_FORMAT_EXTENSIONS[_t])))

  ## -- content -- ##
  size = int, {'indexed': False, 'repeated': True}  # w,h tuple
  default = bool, {'indexed': False, 'default': False}
  location = str, {'indexed': False, 'required': True}
  formats = ImageFormat, {'indexed': False, 'repeated': True}
  storage = ImageStorage, {'indexed': False}


@describe(type=Image)
class Portrait(Image):

  ''' Describes an ``Image`` of a ``Person``. '''

  subject = Key, {'indexed': True}


IMAGE_PREFIXES = {
  Image.ImageStorage.CONTENT: GSTORAGE + 'fcm-content/',
  Image.ImageStorage.RAW: GSTORAGE + 'fcm-warehouse/raw/',
  Image.ImageStorage.PROXY: FCM_FRONTEND + '/image-proxy/providence-clarity/warehouse/'}

IMAGE_FORMAT_EXTENSIONS = {
  Image.ImageFormat.WEBP: 'webp',
  Image.ImageFormat.PNG: 'png',
  Image.ImageFormat.JPEG: 'jpeg',
  Image.ImageFormat.GIF: 'gif'}

IMAGE_FORMAT_PRECEDENCE = (
  Image.ImageFormat.WEBP,
  Image.ImageFormat.PNG,
  Image.ImageFormat.JPEG,
  Image.ImageFormat.GIF)
