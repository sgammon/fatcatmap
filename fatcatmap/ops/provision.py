# -*- coding: utf-8 -*-

'''

  fcm ops: provisioning tools

'''

# stdlib
import sys
import time
import settings

# local
from .gce import Deploy
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


@task
def create(n=1, environment=environment, group=group):

  ''' Create new nodes allows chaining of deployment commands.

      :param n: number of nodes to create
      :param group: which group are these servers '''

  print "About to deploy %s %s %s %s..." % (
    n, environment, group, 'instances' if n > 1 else 'instance'
  )

  try:
    for i, color in zip(reversed(xrange(3)), (colors.green, colors.yellow, colors.red)):
      print color("%s..." % str(i + 1))
      time.sleep(1)
  except KeyboardInterrupt:
    sys.exit(1)

  env.d = Deploy(environment, group)
  env.d.deploy_many(n)

  print colors.yellow("Waiting for instance to finish provisioning...")
  time.sleep(30)


@task
def nodes(environment=environment, group=group, name=None):

  ''' Lists and selects nodes based on specified group.

      :param group: group to select '''

  env.d = Deploy(environment, group)
  env.node = lambda: get_node()  # set env.node for easy access to node object
  if name: env.d.names = [name]
  env.hosts_detail = {}
  _nodes = env.d.get_nodes()
  for node in _nodes:
    env.hosts.append(node.ip)
    env.hosts_detail[node.ip] = node
  print colors.green([node for node in _nodes])
  return env


@task
def status():

  ''' Get status for existing nodes. '''

  node = env.node().node
  print colors.green("status for node " + str(node))


@task
def destroy():

  ''' Destroy existing nodes. '''

  node = env.node().node
  print colors.red("destroying node " + str(node))
  env.d.driver.destroy_node(node)


@task
def activate():

  ''' Activate nodes for live traffic. '''

  node = env.node().node
  print colors.yellow("activating node " + str(node))


@task
def deactivate():

  ''' Deactivate nodes for live traffic. '''

  node = env.node().node
  print colors.yellow("deactivating node " + str(node))
