# -*- coding: utf-8 -*-

'''

  fcm ops tools
  ~~~~~~~~~~~~~

'''

if __debug__:  # only let ops tools run in dev

  try:

    import fabric as __  # powered by fabric

  except ImportError:

    pass  # gracefully fail for non-fab environments

  else:

    # modules and top-level tools
    from . import deploy  # tools to put code into operation in real life
    from . import support  # tools to manage processes that supports code
    from . import provision  # tools to provision & manage infrastructure
    from .deploy import update  # perform graceful updates of the fcm app
    from .deploy import bootstrap  # setup a new box with proper software
    from .deploy import fatcatmap  # uploads and activates fatcatmap code
    from .support import stop, start, k9  # start and stop stuff manually
    from .support import reload, restart  # above, but graceful or forced
    from .provision import nodes, status  # list nodes & summarize status
    from .provision import create, destroy  # start or shutdown a machine
    from .provision import activate, deactivate  # direct traffic up/down


    __all__ = ('bootstrap', 'fatcatmap', 'stop', 'start', 'reload', 'restart',
               'nodes', 'status', 'create', 'destroy', 'activate', 'deactivate',
               'k9', 'update')
