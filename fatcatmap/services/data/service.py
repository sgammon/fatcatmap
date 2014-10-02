# -*- coding: utf-8 -*-

'''

  fcm: data service implementation

'''

# local
from . import exceptions
from .messages import (FetchRequest,
                       FetchResponse)

# rpc
from canteen import rpc, remote, Service


@remote('data')
class DataService(Service):

  ''' Provides an API service for providing access to data,
      in scenarios where the caller has knowledge of at least
      some keys. '''

  exceptions = rpc.Exceptions(**{})

  @remote.method(FetchRequest, FetchResponse)
  def fetch(self, request):

    ''' Fetch multiple datapoints at once (or an individual datapoint)
        along with query/response options.

        :param request: :py:class:`messages.FetchRequest` instance,
          decoded from RPC request data.

        :returns: Instance of :py:class:`messages.FetchResponse`.  '''

    pass
