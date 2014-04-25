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

    # staple inline
    self.staple_data(dict(zip(('meta', 'data', 'graph'), self.graph.construct(None, **{
      'limit': self.request.args.get('limit', self.default_graph['limit']),
      'depth': self.request.args.get('depth', self.default_graph['depth'])
    }).extract(flatten=True))))

    return self.render('landing.haml')
