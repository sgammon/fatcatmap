
from fabric import colors
from fabric.api import env
from fabric.api import task
from fabric import api

from fabtools import require,deb

from settings import GROUP_PACKAGES
import services
from helpers import get_node

@task
def bootstrap():
  node = get_node()
  if node.group=="lb":
    install_haproxy()
    install_nginx
  if node.group == "app":
    install_k9()

@task
def install_k9():
  pass

@task
def install_haproxy():
    pass

@task
def install_nginx():
  pass

@task
def initial_packages():
    node = env.node()
    print colors.yellow("installing apt keys and sources")
    package_dict = GROUP_PACKAGES[node.group]
    for key in package_dict['apt_keys']:
        deb.add_apt_key(url=key)
    for source in package_dict['apt_sources']:
        require.deb.source(*source)

    print deb.install(package_dict['packages'],update=True)
    if node.group == "lb":
        require.files.file(path="/etc/default/haproxy",contents="ENABLED=1",use_sudo=True)
        services.service('nginx','restart')
        services.service('haproxy','restart')


def mariadb():
  add_repo = """
  sudo apt-get -y install python-software-properties &&
  sudo apt-key adv --recv-keys --keyserver keyserver.ubuntu.com 0xcbcb082a1bb943db &&
  sudo add-apt-repository 'deb http://ftp.osuosl.org/pub/mariadb/repo/10.1/debian wheezy main' &&
  sudo apt-get update && sudo apt-get install mariadb-server
  """
  api.run(add_repo)


def rexter():
  rex = """
  apt-get install openjdk-7-jre maven git &&
  cd /tmp && git clone https://github.com/tinkerpop/rexster.git &&
  cd rexster && mvn clean install
  """
  api.sudo(rex)