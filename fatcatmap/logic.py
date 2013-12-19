# -*- coding: utf-8 -*-

'''

  fcm: logic

'''

from canteen import Logic, decorators


@decorators.bind('sample')
class Sample(Logic):

	''' I do logic stuff '''

	def say_hello(self):

		''' '''

		return "whatup, nuggets"


