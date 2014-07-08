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

  sudo("supervisorctl {0} {1}".format(name, action))

@task
def sup():
  pass

@task
def setup_haproxy():
  require.supervisor.process('haproxy',
    command='/base/software/haproxy/sbin/haproxy -f /etc/haproxy/haproxy.conf -db',
    directory='/base/apps',
    user='root'
    )


@task
def setup_httpd():
  require.supervisor.process('httpd',
    command='/base/software/httpd/bin/httpd -f /etc/apache2/httpd.conf -DFOREGROUND',
    directory='/base/apps',
    user='root',
    process_name='httpd'
    )


@task
def setup_k9():
  require.supervisor.process('k9',
    command='/base/software/k9/sbin/k9 --ini /base/software/k9/apphosting/master.ini',
    directory='/base/apps',
    user='root'
    )


@task
def setup_redis():
  require.supervisor.process('redis',
    command='/base/software/redis/bin/redis-server /etc/redis/db.conf --daemonize no'
  )
