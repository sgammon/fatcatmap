# -*- coding: utf-8 -*-

'''

  fcm: video content models

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
class Video(URI):

  ''' Describes the basic concept of a video. '''

  content = None  # can't store video content

  class VideoFormat(struct.BidirectionalEnum):

    ''' Enumerates formats in which a video may be
        available. '''

    FLV = 0x0
    HLS = 0x1
    MPEG = 0x2
    VIMEO = 0x3
    YOUTUBE = 0x4

  ## -- content -- ##
  size = int, {'indexed': False, 'repeated': True}  # w,h tuple
  format = VideoFormat, {'indexed': False}
  default = bool, {'indexed': False, 'default': False}


@describe(descriptor=True, type=Media)
class ImageSet(Model):

  ''' Describes a set of ``Video`` records tied
      together by a common subject, potentially
      with multiple formats and sizes. '''

  videos = Video, {'embedded': True, 'repeated': True}
