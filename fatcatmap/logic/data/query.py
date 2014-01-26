
"""

"""


from canteen import Logic, decorators

from fatcatmap import models


@decorators.bind('data')
class Data(Logic):

	""" """

	def get_native(self, some_object):

		"""Takes key and queries for native of said object"""

		native = some_object.get(some_object.native)

		return native
		