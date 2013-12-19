# -*- coding: utf-8 -*-

'''

  fcm: pages

'''

from canteen import url, Page


@url('landing', '/')
class Landing(Page):

  '''  '''

  def GET(self):

    '''  '''

    return self.render('landing.haml', message=self.sample.say_hello())
