# -*- coding: utf-8 -*-

'''

  fcm: data service implementation

'''

# stdlib
import hashlib, uuid

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

    results, errors, count = [], [], 0
    for key, result in self.data.fetch(request.keys, request.held, **{
      'cached': (request.options.cached if request.options else True),
      'collections': (request.options.collections if request.options else False)}):

      # if we found it...
      if result:
        count += 1
        results.append(result)

      # if we didn't find it...
      else:
        errors.append(key)
        results.append(None)

    return self.data.serialize(FetchResponse, results,
      session=request.session or uuid.uuid4(),
      errors=len(errors))
