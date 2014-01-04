
"""

"""


from canteen import Logic, decorators
from canteen import model

from fatcatmap.models.logic import graph

@decorators.bind('graph')
class Graph(Logic):

	""" """

	def build(self):

		"""Builds a graph/map object and stores in database"""

		# Pull nodes & edges from database
		nodes = graph.Node.query().fetch()
		edges = graph.Edge.query().fetch()

		# buid map
		key = model.Key(graph.Graph, "graph_object")
		graph_object = graph.Graph(nodes=nodes, edges=edges, key=key)

		# put map
		graph_object.put()

		# return key
		return key

	def serve(self, key):

		"""Gets map object from database and serves it to front end"""

		if key.get():
			return key.get()

		else:
			print "key.get() failed. Attempting to build map"
			key = self.build()
			if key:
				return key.get()
			else:
				raise KeyError("YOU FUCKING BROKE IT")
