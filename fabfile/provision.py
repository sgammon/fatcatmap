# -*- coding: utf-8 -*-

'''

  fabric: provision tools
  ~~~~~~~~~~~~~~~~~~~~~~~

'''

# local
from .gce import Deploy
from .helpers import get_node

# fabric
from fabric import colors
from fabric.api import env
from fabric.api import task


group = "web"  # default group
environment = "prod"  # default environment
env.user = "fabric"  # username to use for GCE...should match key name
env.key_filename = ['fabfile/keys/id_rsa']


@task
def create_nodes(n=3, environment=environment, group=group):

  ''' Create new nodes allows chaining of deployment commands

      :param n: number of nodes to create
      :param group: which group are these servers '''

  env.d = Deploy(environment, group)
  env.d.deploy_many(n)
  hosts(environment, group)


@task
def libcloud():
  pass


@task
def hosts(environment=environment, group=group, name=None):

  ''' lists and selects nodes based on specified group

      :param group: group to select '''

  env.d = Deploy(environment, group)
  env.node = lambda: get_node()  # set env.node for easy access to node object
  if name:
    env.d.names = [name]
  env.hosts_detail = {}
  _nodes = env.d.get_nodes()
  for node in _nodes:
    env.hosts.append(node.ip)
    env.hosts_detail[node.ip] = node
  print colors.green([node for node in _nodes])


@task
def destroy():

  '''  '''

  node = env.node().node
  print colors.red("destroying node " + str(node))
  env.d.driver.destroy_node(node)
