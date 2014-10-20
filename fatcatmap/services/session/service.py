# -*- coding: utf-8 -*-

'''

  fcm: session service

'''

# local
from . import messages
from . import exceptions

# rpc
from canteen import remote, Service


@remote.service('session')
class SessionService(Service):

  '''  '''

  #@remote.method()
  def authenticate(self, request):

    ''' Authenticate a session against a user account. '''

    pass

  #@remote.method()
  def authorize(self, request):

    ''' Perform an OAuth2-style authorization, elevating external or internal privileges. '''

    pass
