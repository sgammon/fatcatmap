# -*- coding: utf-8 -*-

'''

  fcm: search service exceptions

'''

# rpc
from canteen.rpc import (ClientException,
                         ServerException)


class InvalidQuery(ClientException):

  '''  '''


class ElasticsearchDown(ServerException):

  '''  '''
