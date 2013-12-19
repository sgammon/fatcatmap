# -*- coding: utf-8 -*-

'''

  fcm: config

'''

__version__ = ((0, 0, 1), (20131219, 'alpha'))


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

    'assets': os.path.join(project, 'assets'),
    'favicon': os.path.join(project, 'assets', 'img', 'branding', 'favicon.ico'),

    'templates': {
      'source': os.path.join(project, 'templates/source')
    }

  }

}, config={

  # HTTP semantics
  'http': {

    # Default headers to add
    'headers': {

      # Debug Headers
      "Canteen": "v%s" % '.'.join(tuple(map(unicode, canteen.__version__))),
      'XAF-Catnip': "v%s %s" % tuple(map(lambda x: x[0].join(map(unicode, x[1])), zip(('.', '-'), __version__))) if __debug__ else None,

    }

  },

  # Template API
  'TemplateAPI': {
    'debug': True,

    'haml': {
      'debug': False,
      'mode': 'indented'
    },

    'syntax': {
      'variable': ('[[', ']]'),
      'block': ('[%', '%]'),
      'comment': ('[#', '#]')
    },

    'jinja2': {

      'autoescape': True,

      'extensions': [
        'jinja2.ext.autoescape',
        'jinja2.ext.with_',
      ] + _custom_jinja2_extensions,

    }
  }


}, assets={


  # Asset API config
  'config': {

    'minified': False,
    'serving_mode': 'local',
    'cdn_prefix': [''],
    'asset_prefix': {
      'style': 'assets/style',
      'image': 'assets/img',
      'script': 'assets/js',
      'font': 'assets/fonts'
    }

  },

  # Asset registry
  'assets': {

    'style': {},
    'scripts': {},
    'fonts': {}

  }


})
