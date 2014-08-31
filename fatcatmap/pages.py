# -*- coding: utf-8 -*-

'''

  fcm: pages

'''

# stdlib
import json

# canteen
from fatcatmap import url, Page


@url('landing', r'/')
@url('catchall', r'/<path:route>')
class Landing(Page):

  '''  '''

  default_graph = {
    'depth': 1,
    'limit': 15
  }

  def GET(self, route='/'):

    '''  '''

    # staple inline
    self.staple_data(dict(zip(('meta', 'data', 'graph'), self.graph.construct(None, **{
      'limit': self.request.args.get('limit', self.default_graph['limit']),
      'depth': self.request.args.get('depth', self.default_graph['depth'])
    }).extract(flatten=True))))

    return self.render('landing.haml')


@url('terms', '/terms')
class TOS(Page):

  '''  '''

  def GET(self):

    '''  '''

    return self.render('legal/terms.haml')


@url('privacy', '/privacy')
class Privacy(Page):

  '''  '''

  def GET(self):

    '''  '''

    return self.render('legal/privacy.haml')
