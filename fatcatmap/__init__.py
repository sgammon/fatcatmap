# -*- coding: utf-8 -*-

'''

  fcm

'''

# stdlib
import os, sys, hashlib, random

# google appengine lib/ shim
try:
  from google import appengine
except ImportError:
  pass
else:
  app_root = os.path.dirname(os.path.dirname(__file__))
  libpath = os.path.abspath(os.path.join(app_root, 'lib'))
  canteen = os.path.abspath(os.path.join(app_root, 'lib', 'canteen'))
  packages = os.path.abspath(os.path.join(app_root, 'lib', 'python2.7', 'site-packages'))
  for path in (libpath, canteen, packages):
    if path not in sys.path:
      sys.path.insert(0, path)

# exports
from canteen import url
from canteen import Page as RawPage


class Page(RawPage):

  ''' '''

  __page_data__ = None  # holds inlined page data
  __js_context__ = {}  # holds javascript context items

  # Content Security Policy
  enable_csp = __debug__  # only enable CSP in debug
  content_nonce = True
  content_security_report_only = True
  content_security_policy = {

    # JavaScript
    'script-src': (
      ('self', 'https://deliver.fcm-static.org', 'https://storage.googleapis.com', 'http://localhost:5000', 'unsafe-eval') if __debug__ else (
      ('self', 'https:', 'deliver.fcm-static.org', 'storage.googleapis.com')
    )),

    # WebSocket / RPC
    'connect-src': (
      ('self', 'https://api.fatcatmap.org', 'https://realtime.fatcatmap.org', 'http://localhost:5000')  if __debug__ else (
      ('self', 'https:', 'api.fatcatmap.org', 'realtime.fatcatmap.org')
    ))

  }

  @property
  def template_context(self):

    '''  '''

    from fatcatmap import config

    # CSP nonce
    _script_nonce = hashlib.md5(str(random.randint(0, 1e4) * random.randint(0, 1e4))).hexdigest()[-8:]

    # set CSP header
    _csp_header = []
    for stanza, content in self.content_security_policy.iteritems():
      content = list(content)
      if self.content_nonce and stanza == 'script-src':
        content.append('nonce-%s' % _script_nonce)  # embed script nonce

      _csp_header.append('%s %s' % (stanza, ' '.join(("'%s'" % i if not i.startswith('http') else i) for i in content)))

    if self.enable_csp:
      if not self.content_security_report_only:
        self.response.headers['Content-Security-Policy'] = ' '.join(_csp_header)
      else:
        self.response.headers['Content-Security-Policy-Report-Only'] = ' '.join(_csp_header)

    # set extra security headers
    self.response.headers['X-Frame-Options'] = 'DENY'
    self.response.headers['X-XSS-Protection'] = '1; mode=block'
    self.response.headers['X-Content-Type-Options'] = 'nosniff'

    # read K9 environment, if any
    k9env = {
      'group': 'local',
      'environment': 'dev',
      'instance': {
        'id': '__virtual__',
        'zone': 'fcm.local',
        'hostname': 'localhost'
      }
    }

    environ = self.environ
    global_environ = os.environ

    for env_source in (environ, global_environ):
      for env_k, env_v in ((k, v) for (k, v) in env_source.iteritems() if k.startswith('K9')):

        # mount instance variables on instance env
        base = k9env['instance'] if 'INSTANCE' in env_k else k9env
        if 'ZONE' in env_k: env_v = env_v.split('/')[-1]  # fix zone names
        if 'HOSTNAME' in env_k: env_v = env_v.split('.')[0]  # grab leaf
        base[env_k.lower().split('_')[-1]] = env_v


    supercontext = super(Page, self).template_context
    return (supercontext.update({
      # javascript context variables
      'pagedata': self.__page_data__,
      'js_context': self._collapse_js_context(),
      'k9': {
        'tools': self.request.args.get('tools') or config.config['fcm'].get('tools', {}).get('enabled', False),
        'metadata': k9env,
        'instance': k9env['instance']
      },
      'nonce': {
        'script': _script_nonce
      }
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
      'services': ServiceHandler.describe(json=False, javascript=False),

      'template': {
        'manifest': self.views.describe()
      }

    }

    return (context.update(self.__js_context__) or context)

  ## == Property Mappings == ##
  page_data = property(lambda self: self.__page_data__)
  js_context = property(lambda self: self.__js_context__)


## == preload all the things! == ##
from .config import *
from .logic import *
from .models import *
from .pages import *
from .services import *


__all__ = (
  'config',
  'logic',
  'models',
  'pages',
  'services',
  'templates'
)
