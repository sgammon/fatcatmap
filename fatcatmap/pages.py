# -*- coding: utf-8 -*-

'''

  fcm: pages

'''

# stdlib
import json

# canteen
from canteen import url, Page


@url('landing', '/')
class Landing(Page):

  '''  '''

  default_graph = {
    'depth': 1,
    'limit': 5
  }

  def GET(self):

    '''  '''

    # build default graph
    meta, data, graph = self.graph.construct(None, **{
      'limit': self.default_graph['limit'],
      'depth': self.default_graph['depth']
    }).extract(flatten=True)

    return self.render('landing.haml', graph=json.dumps({
      'meta': meta, 'data': data, 'graph': graph
    }, separators=(',', ':'), indent=None, skipkeys=True))
