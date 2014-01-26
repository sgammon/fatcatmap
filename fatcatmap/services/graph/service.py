# -*- coding: utf-8 -*-

'''


'''

# submodules
from . import messages

# canteen imports
from canteen import remote, Service, decorators, model


@remote.public('graphservice')
class GraphService(Service):

	''' '''
	
	@remote.public(messages.GraphRequest, messages.GraphResponse)
	def build_graph():

		''' '''

		## create a graph and use the GraphFactory platform to get a key
		graph = self.graph.build()
		return self.graph.serve(graph)

	@remote.public(messages.NativeRequest, messages.NativeResponse)
	def get_native(native_key):

		''' '''

		native = self.data.get_native(native_key)
		return native
