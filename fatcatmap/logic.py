# -*- coding: utf-8 -*-

'''

  fcm: logic

'''

from canteen import Logic, decorators


@decorators.bind('sample')
class Sample(Logic):

  ''' hi i inject stuff '''

  def sayhello(self):

    '''  '''

    return 'hi'
