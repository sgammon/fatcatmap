# -*- coding: utf-8 -*-

'''

  fcm ops: support

'''

# local
from . import settings

# fabric
from fabtools import require
from fabric.api import task, sudo

from services.k9 import init_script as k9_init_script


## build lookup for process names
_SERVICE_NAMES = {
  'proxy': settings.Components.PROXY,
  'http': settings.Components.WEBSERVER,
  'database': settings.Components.DATABASE}

## build ourselves a nice little index
_SERVICES_BY_NAME = {
  v: k for k, v in _SERVICE_NAMES.iteritems()}


@task
def k9():

  ''' Setup K9. '''

  require.file('/etc/init.d/k9',contents=k9_init_script,use_sudo=True)
  require.directory('/var/log/k9/',use_sudo=True)
  sudo('chmod a+x /etc/init.d/k9 && /etc/init.d/k9 restart')


def setup_for_group(group):

  ''' Setup services for a specific group. '''

  sudo("supervisorctl reload")

  # services_installed = []
  # for service in (_SERVICES_BY_NAME[s] for s in
  #         settings.GROUP_SETTINGS[group].get('services', [])):
  #   services_installed.append({
  #     'proxy': setup_proxy,
  #     'http': setup_http,
  #     'database': setup_db
  #   }[service]() or service)  # dispatch proper setup routine
  # return [_SERVICE_NAMES[x] for x in services_installed]
  return []


@task
def service(name, action="restart"):

  ''' Perform an action on a service by name. '''

  # corner case: redis is moody
  if name in ('k9'):
    sudo("touch ")

  if name == 'redis': name == 'redis:redis-server'
  sudo("supervisorctl {1} {0}".format(name, action))

def k9(action="reload"):
   file = settings.K9[action]
   sudo('touch %s' % file)


@task
def stop(*names):

  ''' Stop a service manually. '''

  for name in names:
    service(name, "stop")


@task
def start(*names):

  ''' Start a service manually. '''

  for name in names:
    service(name, "start")


@task
def reload(*names):

  ''' Reload a service manually. '''

  for name in names:
    service(name, "reload")


@task
def restart(*names):

  ''' Restart a service manually. '''

  for name in names:
    service(name, "restart")


def setup_service(service):

  ''' Set up a service declared in configuration. '''

  require.supervisor.process(service, **getattr(settings.ComponentProcesses, service))


@task
def setup_proxy():

  ''' Setup proxy services. '''

  #setup_service(settings.Components.PROXY)
  # currently preinstalled


@task
def setup_http():

  ''' Setup webserver services. '''

  #setup_service(settings.Components.WEBSERVER)
  # currently preinstalled


@task
def setup_apphosting():

  ''' Setup apphosting services. '''

  #setup_service(settings.Components.APPHOSTING)
  # currently preinstalled


@task
def setup_db():

  ''' Setup database services. '''

  #setup_service(settings.Components.DATABASE)
  # currently preinstalled
