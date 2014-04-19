# -*- coding: utf-8 -*-

'''

  fcm: pages

'''

# stdlib
import json

# canteen
from fatcatmap import url, Page


@url('landing', '/')
class Landing(Page):

  '''  '''

  default_graph = {
    'depth': 1,
    'limit': 15
  }

  def GET(self):

    '''  '''

    # build default graph
    meta, data, graph = self.graph.construct(None, **{
      'limit': self.default_graph['limit'],
      'depth': self.default_graph['depth']
    }).extract(flatten=True)

    # staple inline
    self.staple_data({
      'meta': meta,
      'data': data,
      'graph': graph
    })

    return self.render('landing.haml')
