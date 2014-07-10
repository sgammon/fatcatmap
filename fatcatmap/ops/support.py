# -*- coding: utf-8 -*-

'''

  fcm ops: support

'''

# local
from . import settings

# fabric
from fabtools import require
from fabric.api import task, sudo


## build lookup for process names
_SERVICE_NAMES = {
  'proxy': settings.Components.PROXY,
  'http': settings.Components.WEBSERVER,
  'apphosting': settings.Components.APPHOSTING,
  'database': settings.Components.DATABASE
}

## build ourselves a nice little index
_SERVICES_BY_NAME = {
  v: k for k, v in _SERVICE_NAMES.iteritems()
}


def setup_for_group(group):

  ''' Setup services for a specific group. '''

  for service in settings.GROUP_SETTINGS[group].get('services', []):
    {
      'proxy': setup_proxy,
      'http': setup_http,
      'apphosting': setup_apphosting,
      'database': setup_db
    }[service]()  # dispatch proper setup routine


@task
def service(name, action="restart"):

  ''' Perform an action on a service by name. '''

  sudo("supervisorctl {0} {1}".format(name, action))


@task
def stop(name):

  ''' Stop a service manually. '''

  service(name, "stop")


@task
def start(name):

  ''' Start a service manually. '''

  service(name, "start")


@task
def reload(name):

  ''' Reload a service manually. '''

  service(name, "reload")


@task
def restart(name):

  ''' Restart a service manually. '''

  service(name, "restart")


def setup_service(service):

  ''' Set up a service declared in configuration. '''

  require.supervisor.process(service, **getattr(settings.ComponentProcesses, service))


@task
def setup_proxy():

  ''' Setup proxy services. '''

  setup_service(settings.Components.PROXY)


@task
def setup_http():

  ''' Setup webserver services. '''

  setup_service(settings.Components.WEBSERVER)


@task
def setup_apphosting():

  ''' Setup apphosting services. '''

  setup_service(settings.Components.APPHOSTING)


@task
def setup_db():

  ''' Setup database services. '''

  setup_service(settings.Components.DATABASE)
