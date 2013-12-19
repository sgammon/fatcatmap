
"""

"""


from canteen import Logic, decorators

from fatcatmap import models


class Data(Logic):

	""" """

	def get_native(self, some_object):

		"""Takes object and queries for native of said object"""

		native = some_object.get(some_object.native)

		return native
		