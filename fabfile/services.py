# -*- coding: utf-8 -*-

'''

  fabric: services
  ~~~~~~~~~~~~~~~~

'''

# fabric
from fabric.api import env, task, run, sudo
from fabtools import require

@task
def service(name, action="restart"):

  '''  '''
  sudo("service {0} {1}".format(name, action))

@task
def sup():
  pass

@task
def setup_uwsgi():
  require.supervisor.process('myapp',
    command='/path/to/venv/bin/myapp --config production.ini --someflag',
    directory='/path/to/working/dir',
    user='alice',
    stdout_logfile='/path/to/logs/myapp.log',
    )


