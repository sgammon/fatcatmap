# -*- coding: utf-8 -*-

'''

  fcm: config

'''

__version__ = ((0, 0, 1), (20140726, 'alpha'))


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

  }

}, config={

  #### ==== FCM CONFIGURATION === ####

  'fcm': {

    # In-page Devtools
    'tools': {
      'enabled': True
    },

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
      'mode': 'indented'
    },

    'syntax': {
      'variable': ('{{', '}}'),
      'block': ('{%', '%}'),
      'comment': ('{#', '#}')
    },

    'jinja2': {

      'autoescape': True,

      'extensions': [
        'jinja2.ext.autoescape',
        'jinja2.ext.with_',
      ] + _custom_jinja2_extensions,

    }
  },

  ## - Redis
  'RedisAdapter': {
    'debug': True,

    'servers': {

      'default': 'sandbox' if __debug__ else 'local',

      # Redis Instances
      'local': {'host': '127.0.0.1', 'port': 6379},
      'sandbox': {'host': '10.0.5.5', 'port': 6379}
    }
  },


  #### ==== FATCATMAP CONFIGURATION ==== ####

  'api': {

    # JSONRPC
    'rpc': {
      'enabled': True,
      'version': 1,
      'host': None if __debug__ else 'api.fatcatmap.org'  # `None` will use the HTTP request's host and port
    },

    # WebSockets
    'realtime': {
      'enabled': False,
      'version': 1,
      'host': None if __debug__ else 'realtime.fatcatmap.org'  # `None` will use the HTTP request's host and port
    }

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
      'font': 'assets/fonts',
    },

    'extra_assets': {
      'develop-less': ('/assets/less', os.path.join(app, 'assets', 'less')),
      'develop-sources': ('/.develop', os.path.join(os.path.dirname(app), '.develop')),
      'less-sources': ('/.develop/maps/fatcatmap/assets/less', os.path.join(app, 'assets', 'less')),
      'develop-coffee': ('/.develop/maps/fatcatmap/assets/coffee', os.path.join(app, 'assets', 'js'))
    }

  },

  ## - Asset Registry
  'assets': {

    'style': {},
    'scripts': {},
    'fonts': {}

  }

})
