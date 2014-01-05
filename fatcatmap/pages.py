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

    graph = self.data.get_native('blab')
    return self.render('landing.haml', message=graph)
