# -*- coding: utf-8 -*-

'''

  fabric
  ~~~~~~

  Provides several services to deploy.

  Prefixes:
      p: provision related commands

'''

# provisioning tools
from .provision import hosts
from .provision import create
from .provision import destroy

# deployment tools
from .deploy import bootstrap
from .deploy import fatcatmap
from .deploy import mariadb
from .deploy import rexter

# service tools
from .services import stop
from .services import start
from .services import reload
from .services import restart


__all__ = (
  'provision',
  'deploy',
  'services'
)
