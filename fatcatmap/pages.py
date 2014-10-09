# -*- coding: utf-8 -*-

'''

  fcm: pages

'''

# stdlib
import json

# canteen
from canteen import rpc
from canteen.base import handler

# fcm
from fatcatmap import url, Page
from fatcatmap.services.graph import messages as graph


@url('socket', '/sock')
class RealtimePage(handler.RealtimeHandler):

  ''' WIP '''

  def on_message(self, message):

    ''' WIP '''

    if message == 'hi':
      yield 'hey there'
      yield 'this is cool'

    if message == 'goodbye':
      yield 'okbye'
      yield self.terminate(True)

    if message == 'fuckyou':
      yield 'fine then'
      yield self.terminate(False)

    if message == 'hibinary':
      yield bytearray('butts')


@url('landing', '/')
@url('catchall', r'/<path:route>')
class Landing(Page):

  '''  '''

  default_graph = {
    'depth': 2,
    'limit': 5,
    'keys_only': False}

  def GET(self, route='/'):

    '''  '''

    origin = (
      model.Key.from_urlsafe(self.request.args['origin']) if (
        'origin' in self.request.args) else None)

    # staple inline
    self.staple_data(self.graph.construct(None, origin, **{
      'limit': self.request.args.get('limit', self.default_graph['limit']),
      'depth': self.request.args.get('depth', self.default_graph['depth']),
      'keys_only': self.request.args.get('keys_only', self.default_graph['keys_only'])}).to_dict())

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
