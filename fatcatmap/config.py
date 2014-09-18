# -*- coding: utf-8 -*-

'''

  fcm: config

'''

__version__ = ((0, 0, 1), (20140803, 'alpha'))


import os, sys

import canteen
from canteen.util import config as cfg

try:
  from hamlish_jinja import HamlishExtension; HAML = True
except ImportError:
  HAML = None


## Globals
_custom_jinja2_extensions = filter(lambda x: x is not None, [HamlishExtension if HAML else None])
app = os.path.dirname(__file__)

project = os.path.dirname(app)
DEFAULT_BOOT_DISK = 'base-prerelease-v12-alpha-2'
freeze = lambda x: frozenset(x)


## Enumerations
class Components:

  ''' Enumeration of software components. '''

  PROXY = 'haproxy'
  WEBSERVER = 'httpd'
  DATABASE = 'redis'


class DiskType:

  ''' Enumeration of disk types. '''

  MAGNETIC = None
  SSD = 'pd-ssd'


class ComponentProcesses:

  ''' Supervisor configuration for component processes. '''

  haproxy = {'command': ('/base/software/haproxy/sbin/haproxy'
                         ' -f /etc/haproxy/haproxy.conf'
                         ' -db'
                         ' -p /base/ns/pid/haproxy')}

  httpd = {'command': ('/base/software/httpd/bin/httpd'
                       ' -f /etc/apache2/httpd.conf'
                       ' -DFOREGROUND')}

  k9 = {'command': ('/base/software/k9/sbin/k9'
                    ' --ini /base/software/k9/apphosting/master.ini')}

  redis = {'process_name': 'redis-server',
           'command': ('/base/software/redis/bin/redis-server'
                       ' /etc/redis/db.conf'
                       ' --daemonize no')}


config = cfg.Config(app={

  'name': 'fatcatmap',

  # Main app settings
  'debug': __debug__,

  # App paths
  'paths': {

    'app': app,
    'assets': os.path.join(app, 'assets'),
    'favicon': os.path.join(app, 'assets', 'img', 'favicon.ico'),

    'templates': {
      'source': os.path.join(app, 'templates/source'),
      'compiled': 'fatcatmap.templates.compiled'
    }

  },

  # app credentials
  'credentials': {

    'sentry': {
      'endpoint': ('https://3de93e524e09448ea9d08ffda6c5059f:'
                   '1b1fd3facfb9493aa3201a064d0c135b@app.getsentry.com/28386')},

    'service': {
      'apikey': 'AIzaSyBWGO4-IomeAn14S32tgZwcFf9C_yg83y4',

      'installed': {
        'id': '489276160057-jurcfiqvb7213lqu4q65fnqsocesma2m.apps.googleusercontent.com',
        'secret': 'EdwXzTO0qe7X35MCa1UWM-tx'}}

  }

}, config={

  #### ==== FCM CONFIGURATION === ####

  'fcm': {

    # In-page Devtools
    'tools': {
      'enabled': True},

  },

  #### ==== CANTEEN CONFIGURATION ==== ####

  ## - HTTP Semantics
  'http': {

    # Default headers to add
    'headers': {}

  },

  ## - Templates
  'TemplateAPI': {
    'debug': True,

    'force_compiled': not __debug__,

    'haml': {
      'debug': False,
      'mode': 'indented'},

    'syntax': {
      'variable': ('{{', '}}'),
      'block': ('{%', '%}'),
      'comment': ('{#', '#}')},

    'jinja2': {

      'autoescape': True,

      'extensions': [
        'jinja2.ext.autoescape',
        'jinja2.ext.with_',
      ] + _custom_jinja2_extensions}
  },

  ## - Redis
  'RedisAdapter': {

    'debug': True,

    'servers': {

      'default': 'sandbox',

      # Redis Instances
      'local': {'host': '127.0.0.1', 'port': 6379},
      'sandbox': {'host': '10.0.5.5', 'port': 6379}}

  },

  ## - Redis
  'RedisWarehouse': {

    'debug': True,

    'servers': {

      'default': 'local',

      # Redis Instances
      'local': {'host': '127.0.0.1', 'port': 6379},
      'sandbox': {'host': '10.0.5.5', 'port': 6379}}

  },


  #### ==== FATCATMAP CONFIGURATION ==== ####

  'api': {

    # JSONRPC
    'rpc': {
      'enabled': True,
      'version': 1,
      'host': None if __debug__ else 'api.fatcatmap.org'},  # `None` will use the HTTP request's host and port

    # WebSockets
    'realtime': {
      'enabled': False,
      'version': 1,
      'host': None if __debug__ else 'realtime.fatcatmap.org'}  # `None` will use the HTTP request's host and port

  }


}, assets={

  ## - Asset Configuration
  'config': {

    'minified': True,
    'serving_mode': 'cdn',
    'cdn_prefix': ['//storage.googleapis.com/fcm-dev'],

    'asset_prefix': {
      'style': 'assets/style',
      'image': 'assets/img',
      'script': 'assets/js',
      'font': 'assets/fonts'},

    'extra_assets': {
      'develop-less': ('/assets/less', os.path.join(app, 'assets', 'less')),
      'develop-sources': ('/.develop', os.path.join(os.path.dirname(app), '.develop')),
      'less-sources': ('/.develop/maps/fatcatmap/assets/less', os.path.join(app, 'assets', 'less')),
      'develop-coffee': ('/.develop/maps/fatcatmap/assets/coffee', os.path.join(app, 'assets', 'js'))}},

  ## - Asset Registry
  'assets': {

    'style': {},
    'scripts': {},
    'fonts': {}}

}, infrastructure={

  'groups': freeze({'lb', 'app', 'master', 'db'}),
  'environments': freeze({'production', 'staging', 'sandbox'}),

  'gce': {

    'id': '489276160057',

    'project': {
      'name': 'fcm-catnip',
      'id': '489276160057-dffvig7s5uoqg0em72ndnsuvc72jb6m6@developer.gserviceaccount.com',
      'secret': 'C2Dynyq3wBLawgA-INnIICq4'},

    'authorization': {
      'key': 'conf/keys/id_k9',
      'identity': 'conf/credentials/identity.pem',

      'scopes': {
        'base': freeze({
          "compute.read_only",
          "devstorage.read_only"})}},

    'regions': {
      'default': 'us-central1-a',
      'enabled': {
        'us-central1-a',
        'us-central1-b',
        'us-central1-testingf',
        'europe-west1-a'}},

    'startup': {
      'default': 'https://storage.googleapis.com/fcm-dev/base/instance/bootstrap.sh'},

    'environments': {
      'production': {'tags': {'production', 'public'}, 'boot': DEFAULT_BOOT_DISK},
      'staging': {'tags': {'staging', 'internal'}, 'boot': DEFAULT_BOOT_DISK},
      'sandbox': {'tags': {'sandbox', 'internal'}, 'boot': DEFAULT_BOOT_DISK}}},

  'runtime': {
    'user': 'k9',
    'group': 'runtime'},

  'datadog': {
    'key': 'ac728205a32668467a1e4c4f16f61501'},

  'roles': {

    # ~~ settings by role ~~ ##

    'dev': {  # development machines - full access, bleeding edge

      'size': 'n1-standard-1-1x-ssd',
      'image': 'backports-debian-7-wheezy-v20140814',
      'ip_forwarding': True,
      'tags': {'internal', 'dev', 'sandbox'},

      'restrictions': {  # allow restricting environments & regions
        'environments': {'sandbox'},
        'regions': {'us-central1-testingf'}},

      'startup': {  # allow overriding startup boot disk and script
        'boot': DEFAULT_BOOT_DISK,
        'script': 'https://storage.googleapis.com/fcm-dev/base/instance/bootstrap.sh'},

      'scopes': freeze({  # dev machines get full access
        "userinfo.email",
        "devstorage.full_control",
        "taskqueue",
        "bigquery",
        "sqlservice",
        "datastore",
        "compute"}),

      'services': [],  # no services come preinstalled (yet)

      'disk': {
        'size': 20,
        'type': DiskType.SSD}

    },

    'lb': {  # load balancer role

      'size': 'n1-standard-2',
      'image': 'debian-7-wheezy-v20140606',
      'ip_forwarding': True,
      'tags': ['frontline', 'http-server', 'https-server'],
      'scopes': frozenset(),
      'services': [Components.PROXY, Components.WEBSERVER],

      'disk': {
        'size': 10,
        'type': DiskType.SSD,
        'snap': DEFAULT_BOOT_DISK}},

    'app': {  # app server role

      'size': 'n1-standard-2',
      'image': 'debian-7-wheezy-v20140606',
      'ip_forwarding': False,
      'tags': {'app', 'db'},  # @TODO(sgammon): split out DB role

      'scopes': freeze({
        "userinfo.email",
        "devstorage.read_write",
        "taskqueue",
        "bigquery",
        "sqlservice",  # TODO(sgammon): delegate to db role
        "datastore"}),  # @TODO(sgammon): delegate to db role

      'services': [
        Components.PROXY,  # @TODO(sgammon): split out proxy role
        Components.WEBSERVER,  # @TODO(sgammon): delegate webserver to lb role
        Components.DATABASE],

      'disk': {
        'size': 20,
        'type': DiskType.SSD,
        'snap': DEFAULT_BOOT_DISK}},

    'db': {  # @TODO(weisberger): for future use :)

      'size': 'n1-standard-2',
      'image': 'debian-7-wheezy-v20140606',
      'ip_forwarding': False,
      'tags': ['db'],

      'scopes': freeze({
        "userinfo.email",
        "devstorage.read_write",
        "taskqueue",
        "bigquery",
        "sqlservice",
        "datastore"}),

      'services': [Components.DATABASE],

      'disk': {
        'size': 40,
        'type': DiskType.SSD,
        'snap': DEFAULT_BOOT_DISK}}

  }

})
