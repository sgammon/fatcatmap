# -*- coding: utf-8 -*-

'''

  fcm: image content models

'''

# canteen
from canteen import struct

# models
from .. import (Model,
                describe)

# descriptor models
from ..descriptors.ext import URI

# content models
from ..abstract.content import Media


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

  ## -- content -- ##
  size = int, {'indexed': False, 'repeated': True}  # w,h tuple
  format = ImageFormat, {'indexed': False}
  default = bool, {'indexed': False, 'default': False}


@describe
class Portrait(Image):

  ''' Describes an ``Image`` of a ``Person``. '''


@describe(descriptor=True, type=Media)
class ImageSet(Model):

  ''' Describes a set of ``Image`` records tied
      together by a common subject, potentially
      with multiple formats and sizes. '''

  images = Image, {'embedded': True, 'repeated': True}
