# -*- coding: utf-8 -*-

'''

  fcm: pages

'''

# stdlib
import json

# canteen
from fatcatmap import url, Page


from canteen.base import handler


# if there's realtime support, mount appropriate handler...
if hasattr(handler, 'RealtimeHandler'):

  @url('socket', '/sock')
  class RealtimePage(handler.RealtimeHandler):

    ''' WIP '''

    def on_message(self, message):

      ''' WIP '''

      if message == 'hi':
        yield 'hey there'
        yield 'this is cool'



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
