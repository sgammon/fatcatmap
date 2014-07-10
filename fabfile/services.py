# -*- coding: utf-8 -*-

'''

  fabric: services
  ~~~~~~~~~~~~~~~~

'''

# fabric
from fabric.api import env, task, run, sudo
from fabtools import require


_SERVICE_NAMES = {
  'proxy': 'haproxy',
  'http': 'httpd',
  'apphosting': 'k9',
  'database': 'redis:redis-server'
}


@task
def service(name, action="restart"):

  '''  '''

  sudo("supervisorctl {0} {1}".format(name, action))


@task
def stop(name):

  '''  '''

  service(name, "stop")


@task
def start(name):

  '''  '''

  service(name, "start")


@task
def reload(name):

  '''  '''

  service(name, "reload")


@task
def restart(name):

  '''  '''

  service(name, "restart")


@task
def setup_proxy():

  '''  '''

  require.supervisor.process('haproxy',
    command='/base/software/haproxy/sbin/haproxy -f /etc/haproxy/haproxy.conf -db -p /base/ns/pid/haproxy',
    directory='/base/apps',
    user='root',
    process_name='haproxy'
    )


@task
def setup_http():

  '''  '''

  require.supervisor.process('httpd',
    command='/base/software/httpd/bin/httpd -f /etc/apache2/httpd.conf -DFOREGROUND',
    directory='/base/apps',
    user='root',
    process_name='httpd'
    )


@task
def setup_apphosting():

  '''  '''

  require.supervisor.process('k9',
    command='/base/software/k9/sbin/k9 --ini /base/software/k9/apphosting/master.ini',
    directory='/base/apps',
    user='root',
    process_name='k9'
    )


@task
def setup_db():

  '''  '''

  require.supervisor.process('redis',
    command='/base/software/redis/bin/redis-server /etc/redis/db.conf --daemonize no',
    directory='/base/data',
    process_name='redis-server',
    user='root'
  )
