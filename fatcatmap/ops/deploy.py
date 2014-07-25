# -*- coding: utf-8 -*-

'''

  fabric: deploy tools
  ~~~~~~~~~~~~~~~~~~~~

'''

# stdlib
import os

# local
from . import support
from . import helpers
from .helpers import notify
from .support import service
from .helpers import get_node

# fabric
from fabric import colors, api
from fabric.api import env, task
from fabtools import require, deb


@notify
@task
def bootstrap(_hosts=True):

  ''' Prepare a newly-provisioned node with supporting software. '''

  node = get_node()

  ## ~~ app nodes ~~ ##
  if node.group == 'app':

    ## ~~ install apps ~~ ##
    fatcatmap(node.environment)

    ## ~~ start k9 ~~ ##
    api.sudo("/base/software/k9/sbin/k9 --ini /base/software/k9/apphosting/master.ini")

  ## ~~ install services-n-stuff ~~ ##
  services = support.setup_for_group(group=node.group)

  ## ~~ start supporting services ~~ ##
  support.start(*services)


@notify
@task
def fatcatmap(environment):

  '''  '''

  print colors.yellow('Deploying fatcatmap on host %s...' % get_node())
  helpers.pause()

  install_fcm = """
  cd /base/apps;
  gsutil cp gs://fcm-dev/%s/%s/app/latest.tar.gz - | tar -xvz;
  rm -fr /base/apps/fatcatmap/lib/python2.7 /base/apps/fatcatmap/bin;
  virtualenv --python=/usr/bin/python /base/apps/fatcatmap;
  """ % (environment, 'builds' if environment == 'sandbox' else 'releases')

  api.run(install_fcm)

  # fix permissions & install deps
  api.sudo("chown k9:runtime -R /base/apps/fatcatmap")
  api.sudo("chmod +x /base/apps/fatcatmap/bin/*")
  api.run("/base/apps/fatcatmap/bin/pip install -r /base/apps/fatcatmap/requirements.txt")

  api.sudo("touch /base/ns/trigger/k9.reload /base/ns/trigger/apps/fatcatmap.reload")


@notify
@task
def mariadb():

  '''  '''

  add_repo = """
  sudo apt-get -y install python-software-properties &&
  sudo apt-key adv --recv-keys --keyserver keyserver.ubuntu.com 0xcbcb082a1bb943db &&
  sudo add-apt-repository 'deb http://ftp.osuosl.org/pub/mariadb/repo/10.1/debian wheezy main' &&
  sudo apt-get update && sudo apt-get install mariadb-server
  """
  api.run(add_repo)


@notify
@task
def rexter():

  '''  '''

  rex = """
  apt-get install openjdk-7-jre maven git &&
  cd /tmp && git clone https://github.com/tinkerpop/rexster.git &&
  cd rexster && mvn clean install
  """
  api.sudo(rex)
