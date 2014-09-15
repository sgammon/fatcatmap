# -*- coding: utf-8 -*-

'''

  fcm: abstract content models

'''

# graph models
from .. import (Model,
                describe)


@describe(abstract=True)
class Content(Model):

  ''' Specifies content, like news articles, prose, images,
      and other stuff like that. '''


@describe(type=Content)
class Prose(Content):

  ''' Specifies text content, in written form, with sentences
      and grammar, etc. '''


@describe(type=Content)
class Media(Content):

  ''' Specifies rich media like images, audio, video, etc
      as items of content. '''
