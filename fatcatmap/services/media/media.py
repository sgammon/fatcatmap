"""

"""

from canteen import remote, Service, decorators, model

@remote.public('media')
class MediaSession(Service):

	''' '''

  @remote.public(messages.ImageRequest, messages.ImageResponse)
	def get_image(key):

		image = ImagePlatform.get_image(key)

		return image