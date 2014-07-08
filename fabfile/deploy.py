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
from settings import GROUP_PACKAGES

# fabric
from fabric import colors, api
from fabric.api import env, task
from fabtools import require, deb


@task
def bootstrap(environment, group):

  '''  '''

  import provision

  # set up our env
  env.user = settings.USER
  env.disable_known_hosts = True
  env.key_filename = os.path.join(os.path.dirname(__file__), "keys", "id_k9")

  provision.hosts()
  node = get_node()
  env.host_string = "k9@%s:22" % node.ip

  if group == 'app':

    ## ~~ install apps ~~ ##
    fatcatmap(environment)

    ## ~~ install appserver stuff ~~ ##
    services.setup_haproxy()
    services.setup_httpd()
    services.setup_k9()
    services.setup_redis()

    ## ~~ enable & start appserver stuff ~~ ##
    service('haproxy', 'start')
    service('httpd', 'start')
    service('k9', 'start')
    service('redis', 'start')


def fatcatmap(environment):

  '''  '''

  install_fcm = """
  cd /base/apps;
  gsutil cp gs://fcm-dev/%s/%s/app/latest.tar.gz - | tar -xvz;
  """ % (environment, 'builds' if environment == 'sandbox' else 'releases')

  api.run(install_fcm)

  # fix permissions
  api.sudo("chown k9:runtime -R /base/apps/fatcatmap")


@task
def install_haproxy():

    '''  '''

    pass


@task
def install_nginx():

  '''  '''

  pass


@task
def initial_packages():

  '''  '''

  node = env.node()

  try:
    package_dict = GROUP_PACKAGES[node.group]
    print colors.yellow("installing apt keys and sources")
    for key in package_dict['apt_keys']:
      deb.add_apt_key(url=key)
    for source in package_dict['apt_sources']:
      require.deb.source(*source)
    print deb.install(package_dict['packages'], update=True)
  except:
    print colors.green('skipping apt')

  #if node.group == "lb":
  #  require.files.file(path="/etc/default/haproxy", contents="ENABLED=1", use_sudo=True)
  #  services.service('nginx', 'restart')
  #  services.service('haproxy', 'restart')


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
