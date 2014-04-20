# -*- coding: utf-8 -*-

'''

  fcm: config

'''

__version__ = ((0, 0, 1), (20140417, 'alpha'))


import os
import canteen
from canteen.util import config as cfg

try:
  from hamlish_jinja import HamlishExtension; HAML = True
except ImportError:
  HAML = None


## Globals
_custom_jinja2_extensions = filter(lambda x: x is not None, [HamlishExtension if HAML else None])
app = os.path.abspath(os.path.dirname(__file__))
project = os.path.dirname(app)

config = cfg.Config(app={

  'name': 'fatcatmap',

  # Main app settings
  'debug': True,

  # App paths
  'paths': {

    'assets': os.path.join(app, 'assets'),
    'favicon': os.path.join(app, 'assets', 'img', 'favicon.ico'),

    'templates': {
      'source': os.path.join(app, 'templates/source'),
      'compiled': 'fatcatmap.templates.compiled'
    }

  }

}, config={

  #### ==== CANTEEN CONFIGURATION ==== ####

  ## - HTTP Semantics
  'http': {

    # Default headers to add
    'headers': {

      # Debug Headers
      "Canteen": "v%s" % '.'.join(tuple(map(unicode, canteen.__version__))),
      'XAF-Catnip': "v%s %s" % tuple(map(lambda x: x[0].join(map(unicode, x[1])), zip(('.', '-'), __version__))) if __debug__ else None,

    }

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

      'default': 'sandbox',

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
      'host': None if __debug__ else 'fatcatmap.org'  # `None` will use the HTTP request's host and port
    },

    # WebSockets
    'realtime': {
      'enabled': False,
      'version': 1,
      'host': None if __debug__ else 'fatcatmap.org'  # `None` will use the HTTP request's host and port
    }

  }


}, assets={

  ## - Asset Configuration
  'config': {

    'minified': False,
    'serving_mode': 'local',
    'cdn_prefix': [''],

    'asset_prefix': {
      'style': 'assets/style',
      'image': 'assets/img',
      'script': 'assets/js',
      'font': 'assets/fonts',
    },

    'extra_assets': {
      'develop-less': ('/assets/less', os.path.join(app, 'assets', 'less')),
      'develop-sources': ('/.develop', os.path.join(os.path.dirname(app), '.develop')),
      'less-sourcs': ('/.develop/maps/fatcatmap/assets/less', os.path.join(app, 'assets', 'less')),
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
