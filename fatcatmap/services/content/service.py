# -*- coding: utf-8 -*-

'''

  fcm: content service

'''

# fcm
from . import messages
from . import exceptions

# RPC APIs
from canteen import rpc


@rpc.remote.service('content')
class ContentService(rpc.Service):

  '''  '''

  def generate(self, request):

    '''  '''

    pass

  @rpc.remote.method(messages.TemplateRequest, messages.ClientTemplate)
  def template(self, request):

    ''' Retrieves a client-side template. '''

    if not request:
      raise self.exceptions.bad_request('No request received.')

    if not request.path:
      raise self.exceptions.bad_request('Template requests require a path to retrieve.')

    try:
      return messages.ClientTemplate(**{
        'source': self.views.load_template(request.path),
        'path': request.path
      }).to_message()
    except ValueError:
      # template was invalid
      raise self.exceptions.template_not_found('Couldn\'t find template ' + request.path)
