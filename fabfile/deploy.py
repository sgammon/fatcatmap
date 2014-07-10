# -*- coding: utf-8 -*-

'''

  fabric: deploy tools
  ~~~~~~~~~~~~~~~~~~~~

'''

# local
import os
import services, settings
from services import service
from helpers import get_node

# fabric
from fabric import colors, api
from fabric.api import env, task
from fabtools import require, deb


@task
def bootstrap(_hosts=True):

  '''  '''

  node = get_node()
  env.disable_known_hosts = True

  if node.group == 'app':

    ## ~~ install apps ~~ ##
    fatcatmap(node.environment)

    ## ~~ install appserver stuff ~~ ##
    services.setup_proxy()
    services.setup_http()
    services.setup_db()
    services.setup_apphosting()

    ## ~~ enable & start appserver stuff ~~ ##
    service.start('redis:redis-server')
    service.start('apphosting')
    service.start('http')
    service.start('proxy')


def fatcatmap(environment):

  '''  '''

  install_fcm = """
  cd /base/apps;
  gsutil cp gs://fcm-dev/%s/%s/app/latest.tar.gz - | tar -xvz;
  """ % (environment, 'builds' if environment == 'sandbox' else 'releases')

  api.run(install_fcm)

  # fix permissions
  api.sudo("chown k9:runtime -R /base/apps/fatcatmap")


def mariadb():

  '''  '''

  add_repo = """
  sudo apt-get -y install python-software-properties &&
  sudo apt-key adv --recv-keys --keyserver keyserver.ubuntu.com 0xcbcb082a1bb943db &&
  sudo add-apt-repository 'deb http://ftp.osuosl.org/pub/mariadb/repo/10.1/debian wheezy main' &&
  sudo apt-get update && sudo apt-get install mariadb-server
  """
  api.run(add_repo)


def rexter():

  '''  '''

  rex = """
  apt-get install openjdk-7-jre maven git &&
  cd /tmp && git clone https://github.com/tinkerpop/rexster.git &&
  cd rexster && mvn clean install
  """
  api.sudo(rex)
