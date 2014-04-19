# -*- coding: utf-8 -*-

'''

  fcm

'''

# exports
from canteen import url
from canteen import Page as RawPage


class Page(RawPage):

  ''' '''

  __page_data__ = None  # holds inlined page data
  __js_context__ = {}  # holds javascript context items

  @property
  def template_context(self):

    '''  '''

    supercontext = super(Page, self).template_context
    return (supercontext.update({

      # javascript context variables
      'pagedata': self.__page_data__,
      'js_context': self._collapse_js_context()

    }) or supercontext)

  def staple_data(self, data):

    '''  '''

    return setattr(self, '__page_data__', data) or self.__page_data__

  def _collapse_js_context(self):

    '''  '''

    from canteen.rpc import ServiceHandler

    context = {

      ## == pagedata settings == ##
      'pagedata': bool(self.__page_data__),

      ## == protocol settings == ##
      'protocol': {

        # JSONRPC
        'rpc': {
          'enabled': self.config.get('api', {}).get('rpc', {}).get('enabled', True),
          'secure': False if __debug__ else True,
          'host': self.config.get('api', {}).get('rpc', {}).get('host') or self.request.host,
          'version': self.config.get('api', {}).get('rpc', {}).get('version') or 1
        },

        # WebSockets
        'realtime': {
          'enabled': self.config.get('api', {}).get('realtime', {}).get('enabled', True),
          'secure': False if __debug__ else True,
          'host': self.config.get('api', {}).get('realtime', {}).get('host') or self.request.host,
          'version': self.config.get('api', {}).get('realtime', {}).get('version') or 1
        }
      },

      ## == session data == ##
      'session': {
        'established': None
      },

      ## == agent capabilities == ##
      'agent': {
        'capabilities': {
          'webp': self.agent.capabilities.webp,
          'spdy': self.agent.capabilities.spdy,
          'webm': self.agent.capabilities.webm
        }
      },

      ## == services == ##
      'services': ServiceHandler.describe(json=False, javascript=False)

    }

    return (context.update(self.__js_context__) or context)

  ## == Property Mappings == ##
  page_data = property(lambda self: self.__page_data__)
  js_context = property(lambda self: self.__js_context__)


def preload():

  '''  '''

  # preload fcm modules
  from fatcatmap.logic import *
  from fatcatmap.models import *
  from fatcatmap.services import *
  from fatcatmap.templates.compiled import *


__all__ = (
  'config',
  'logic',
  'models',
  'pages',
  'services',
  'templates'
)
