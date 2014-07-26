# -*- coding: utf-8 -*-

'''

  fcm: content service

'''

# stdlib
import os

# fcm
from . import messages
from . import exceptions
from fatcatmap import config

# RPC APIs
from canteen import rpc


## Template Path
template_path = os.path.join(config.app['paths']['app'], 'assets', 'js', 'templates')


@rpc.remote.service('content')
class ContentService(rpc.Service):

  '''  '''

  exceptions = rpc.Exceptions({
    'bad_request': rpc.ClientException,
    'template_not_found': exceptions.TemplateNotFound
  })

  @rpc.remote.method(messages.ContentRequest, messages.GeneratedContent)
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

    full_path = os.path.join(template_path, *(x for x in request.path.split('/') if x))

    if not os.path.isfile(full_path):
      raise self.exceptions.template_not_found('Couldn\'t find template ' + request.path)

    with open(full_path, 'r') as template:
      return messages.ClientTemplate(**{
        'source': ''.join([line for line in template]),
        'path': request.path
      }).to_message()
