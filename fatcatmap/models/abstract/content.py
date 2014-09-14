# -*- coding: utf-8 -*-

'''

    fcm: content models

'''

# graph models
from .. import describe, Model


@describe(abstract=True)
class Content(Model):

  ''' Specifies content, like news articles, prose, images,
  	  or stuff like that. '''
