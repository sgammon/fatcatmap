# -*- coding: utf-8 -*-

'''

  fcm: content service

'''

# messages
from . import messages

# RPC APIs
from canteen import rpc


@rpc.public('content')
class ContentService(rpc.Service):

  '''  '''

  @rpc.public(messages.ContentRequest, messages.GeneratedContent)
  def generate(self, request):

    '''  '''

    pass
