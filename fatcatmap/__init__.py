# -*- coding: utf-8 -*-

'''

  fcm

'''

# stdlib
import os, re, sys, hashlib, random, operator, itertools

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
from canteen.logic.session import ClientSession


## Globals
_clean_markup = re.compile(' +')


# @TODO(sgammon): in general this file needs massive cleanup


class Page(RawPage):

  ''' Extends Canteen's builtin base ``Page`` class to provide ``catnip``-
      specific template context and functionality.

      Also provides:
        - stapled page data (provided to handlers at `self.staple_data`)
        - CSP header autogeneration (beta, use with caution)
        - custom JS context (provided at `_collapse_js_context`) '''

  __page_data__ = None  # holds inlined page data
  __js_context__ = {}  # holds javascript context items

  # Content Security Policy
  enable_csp = 'K9_ENVIRONMENT' in os.environ  # only enable CSP in debug
  enable_slim = 'K9_ENVIRONMENT' in os.environ
  content_nonce = True
  content_security_report_only = True
  content_security_policy = {

    # JavaScript
    'script-src': (
      ('self', 'https://deliver.fcm-static.org', 'https://storage.googleapis.com', 'http://localhost:5000', 'unsafe-eval') if __debug__ else (
      ('self', 'https:', 'deliver.fcm-static.org', 'storage.googleapis.com'))),

    # WebSocket / RPC
    'connect-src': (
      ('self', 'https://api.fatcatmap.org', 'https://realtime.fatcatmap.org', 'http://localhost:5000')  if __debug__ else (
      ('self', 'https:', 'api.fatcatmap.org', 'realtime.fatcatmap.org')))}


  @property
  def template_context(self):

    ''' Provides ``catnip``-specific Jinja2 template context, like the CSP nonce
        and any stapled page data. Headers are also injected from here, which is
        completely horrible practice and I should honestly be shot for it, but
        deal - it works.
              -sam '''

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

    # @TODO(sgammon): don't inject headers from template context calculations, dumbass

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
        'hostname': 'localhost'}}

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

    # @TODO: don't hardcode deliver domain
    js_context = self._collapse_js_context()
    js_context['k9'] = k9env  # mount K9 environment
    hosts = {  # generate hosts
        'api': js_context['protocol']['rpc']['host'],
        'realtime': js_context['protocol']['realtime']['host'],
        'deliver': 'deliver.fcm-static.org',
        'storage': 'storage.googleapis.com'}

    # generate DNS prefetch list
    dns_prefetch = set()
    for i in (d for d in hosts.itervalues() if 'localhost' not in d):
      dns_prefetch.add(i)

    return (supercontext.update({
      # javascript context variables
      'pagedata': self.__page_data__,
      'js_context': js_context,
      'k9': {
        'tools': self.request.args.get('tools') or config.config['fcm'].get('tools', {}).get('enabled', False),
        'metadata': k9env,
        'instance': k9env['instance']
      },
      'frontend': {
        'templates': ((k, v) for k, v in sorted(self.views.describe().iteritems(), key=operator.itemgetter(0)))},
      'config': config,
      'hosts': hosts,
      'dns_prefetch': (i for i in dns_prefetch),
      'nonce': {
        'script': _script_nonce
      }}) or supercontext)

  def staple_data(self, data):

    ''' Attach a blob of data that should be passed to the page as "pagedata",
        which can be used as a one-item slot of information to be preloaded in
        raw JSON and served with the page directly.

        If a developer anticipates that a user will need a particular API
        response (for instance, an empty graph request for a cold hit/new user),
        they can prefetch the data server-side (where latency is low) and
        "staple" it to the page context.

        It will automatically be picked up and included in the JS context, and
        will be made globally available to catnip JS.

        :param data: Raw Python data value (usually a ``dict``) that must be
          recursively serializable by JSON.

        :raises TypeError: If an object that is not JSON serializable is stapled
          to the page, located anywhere recursively in ``data``.

        :returns: Value of ``data`` that was stapled to the page. '''

    try:
      return setattr(self, '__page_data__', data) or self.__page_data__
    except TypeError:
      raise  # dumbass

  def _collapse_js_context(self):

    ''' Collapse template context to provide a rich configuration payload to
        ``catnip`` JS. Include useful tidbits like:

        - state/config of RPC (and services manifest)
        - realtime dispatch configuration + endpoints
        - session state
        - detected agent capabilities
        - the presence of stapled page data
        - manifest of client-side templates

        :returns: Merged and collapsed JS context. '''

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
          'version': self.config.get('api', {}).get('rpc', {}).get('version') or 1},

        # WebSockets
        'realtime': {
          'enabled': self.config.get('api', {}).get('realtime', {}).get('enabled', True),
          'secure': False if __debug__ else True,
          'host': self.config.get('api', {}).get('realtime', {}).get('host') or self.request.host,
          'version': self.config.get('api', {}).get('realtime', {}).get('version') or 1}},

      ## == session data == ##
      'session': {
        'id': self.session.id,
        'auth': self.session.get('auth', False),
        'token': None,
        'scopes': tuple()},

      ## == agent capabilities == ##
      'agent': {
        'capabilities': {
          'webp': self.agent.capabilities.webp if getattr(self, 'agent', None) else False,
          'spdy': self.agent.capabilities.spdy if getattr(self, 'agent', None) else False,
          'webm': self.agent.capabilities.webm if getattr(self, 'agent', None) else False}},

      ## == services == ##
      'services': ServiceHandler.describe(json=False, javascript=False),

      'template': {
        'manifest': self.views.describe().keys()}

    }

    return (context.update(self.__js_context__) or context)

  def render(self, template,
                   headers=None,
                   content_type='text/html; charset=utf-8',
                   context=None,
                   _direct=False, **kwargs):

    """ Render a source ``template`` for the purpose of responding to this
        ``Handler``'s request, given ``context`` and proper ``headers`` for
        return.

        ``kwargs`` are taken as extra template context and overlayed onto
        ``context`` before render.

        :param template: Path to template file to serve. ``str`` or ``unicode``
          file path.

        :param headers: Extra headers to send with response. ``dict`` or iter of
          ``(name, value)`` tuples.

        :param content_type: Value to send for ``Content-Type`` header. ``str``,
          defaults to ``text/html; charset=utf-8``.

        :param context: Extra template context to include during render.
          ``dict`` of items, with keys as names that values are bound to in the
          resulting template context.

        :param _direct: Flag indicating that ``self`` should be returned, rather
          than ``self.response``. Bool, defaults to ``False`` as this
          technically breaks WSGI.

        :param kwargs: Additional items to add to the template context.
          Overrides all other sources of context.

        :returns: Rendered template content, added to ``self.response``. """

    from canteen.util import config

    # set mime type
    if content_type: self.response.mimetype = content_type

    # collapse and merge HTTP headers (base headers first)
    self.response.headers.extend(itertools.chain(
      iter(self.http.base_headers),
      self.config.get('http', {}).get('headers', {}).iteritems(),
      self.headers.iteritems(),
      (headers or {}).iteritems()))

    # merge template context
    _merged_context = dict(itertools.chain(*(i.iteritems() for i in (
      self.template.base_context,
      self.template_context,
      context or {},
      kwargs))))

    def chunk(content):

      ''' Process a chunk of rendered template content. '''

      if self.enable_slim:
        return _clean_markup.sub(' ', content.replace("\n", ''))
      return content

    # render template and set as response data
    self.response.response, self.response.direct_passthrough = (
      (chunk(c) for c in self.template.render(
        self,
        getattr(self.runtime, 'config', None) or config.Config(),
        template,
        _merged_context))), True

    return self.respond(direct=_direct)

  ## == Property Mappings == ##
  page_data = property(lambda self: self.__page_data__)
  js_context = property(lambda self: self.__js_context__)


## == preload all the things! == ##
from .config import *
from .logic import *
from .models import *
from .bindings import *
from .pages import *
from .services import *


__all__ = ('config',
           'logic',
           'models',
           'bindings',
           'pages',
           'services',
           'templates')
