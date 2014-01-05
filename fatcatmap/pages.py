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

    graph = self.graph.serve()
    return self.render('landing.haml', message=graph)
