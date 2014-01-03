
"""

"""


from canteen, import Logic, decorators

@decorators.bind('ImagePlatform')
class Image(Logic):

	""" """

	def get_image(self, key_id):

		"""Takes key_id, finds location, and returns image"""

		url = "http://someurl.com/" + key_id

		return url