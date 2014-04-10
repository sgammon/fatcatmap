# -*- coding: utf-8 -*-

'''


'''

# messages and RPC
from . import messages
from canteen import remote, Service


@remote.public('graph')
class GraphService(Service):

	''' '''

	@remote.public(messages.GraphRequest, messages.GraphResponse)
	def construct(self, request):

		''' '''

		return messages.GraphResponse()
