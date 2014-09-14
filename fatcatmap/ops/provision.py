# -*- coding: utf-8 -*-

'''

  fcm ops: provisioning tools

'''

from __future__ import print_function

# stdlib
import time
import settings

# local
from .gce import Deploy
from .helpers import pause
from .helpers import notify
from .helpers import get_node

# fabric
from fabric import colors
from fabric.api import env
from fabric.api import task


## Globals
group = "app"  # default group
environment = "sandbox"  # default environment
env.disable_known_hosts = True  # known hosts sucks though right
env.user = settings.USER  # username to use for GCE...should match key name
env.key_filename = settings.KEY  # SSH key to use for GCE


#@notify
@task
def create(n=1, region=settings.DEFAULT_REGION, environment=environment, group=group):

  ''' Create new nodes allows chaining of deployment commands.

      :param n: Number of nodes to create.
      :param region: GCE region to deploy to.
      :param environment: ``production``/``staging``/``sandbox``.
      :param group: Role (``group``) for these new instances. '''

  print("Provisioning %s %s %s %s in %s..." % (
    n, environment, group, 'instances' if n > 1 else 'instance', region
  ))

  pause()  # 3 second chance to exit

  env.d = Deploy(environment, group, region)
  names = env.d.deploy_many(n)

  print(colors.yellow("Waiting for %s to finish provisioning..." % ('instances' if n > 1 else 'instance')))
  time.sleep(30)
  if n==1:
    nodes(environment=environment,name=names[0])
  else:
    print("warning all nodes selected because n > 1")
    nodes(environment, group)


@task
def nodes(environment=environment, group=group, name=None, region=settings.DEFAULT_REGION):

  ''' Lists and selects nodes based on specified group, name, or region.

      :param environment: Fabric environment.
      :param group: Group (or instance role) to select.
      :param name: Name (``str``) template to filter by.
      :param region: GCE region to scan. '''

  env.d = Deploy(environment, group, region)
  env.node = lambda: get_node()  # set env.node for easy access to node object
  if name:
    env.d.names = [name]
  env.hosts_detail = {}
  _nodes = env.d.get_nodes()
  for node in _nodes:
    if (not name) or (name and (node.name == name or name in node.name)):
      env.hosts.append(node.ip)
      env.hosts_detail[node.ip] = node

  print(colors.green([node for ip, node in env.hosts_detail.iteritems()]))
  return env


@task
def status():

  ''' Get status for existing nodes. '''

  node = env.node().node
  print(colors.green("status for node " + str(node)))


@notify
@task
def destroy():

  ''' Destroy existing nodes. '''

  node = env.node().node
  print(colors.red("destroying node " + str(node)))
  env.d.driver.destroy_node(node)


@notify
@task
def activate():

  ''' Activate nodes for live traffic. '''

  node = env.node()
  print(colors.yellow("activating node " + str(node)))
  node.targetpool_add()


@notify
@task
def deactivate():

  ''' Deactivate nodes for live traffic. '''

  node = env.node()
  print(colors.yellow("deactivating node " + str(node)))
  node.targetpool_remove()
