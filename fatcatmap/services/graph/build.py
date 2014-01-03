"""


"""


## canteen imports
from canteen import Sessions, Service decorators 

@rpc.platform
class GraphService(Service):

	''' '''

	def build_graph():

		''' '''

		## create a graph and use the GraphFactory platform to get a key
		graph = GraphFactory.build()

		return GraphFactory.serve(graph)

	def get_native(native_key):

		''' '''

		native = DataPlatform.get_native(native_key)

		return native