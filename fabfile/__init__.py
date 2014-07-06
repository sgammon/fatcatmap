# -*- coding: utf-8 -*-

'''

  fabric
  ~~~~~~

  Provides several services to deploy.

  Prefixes:
      p: provision related commands

'''

# local
from .provision import hosts
from .deploy import bootstrap
from . import provision as p, deploy as d
