# -*- coding: utf-8 -*-

'''

  fabric: helpers
  ~~~~~~~~~~~~~~~

'''

from __future__ import print_function

# stdlib
import sys
import time

# local
from . import settings

# fabric
from fabric import colors
from fabric.api import env

#libcloud
from libcloud.common.google import ResourceNotFoundError

# fabric integration
#from dogapi.fab import setup
#from dogapi.fab import notify
#setup(settings.DATADOG_KEY)


def get_node():

  ''' Retrieve host details about the currently-active node.

      :returns: Host details from Fabric environment. '''

  return env.hosts_detail[env.host]


def pause():

  ''' Pause deploy/execution flow for a few seconds to allow a human to catch
      up in the log or stop it in time. '''

  try:
    for i, color in zip(reversed(xrange(3)), (colors.green, colors.yellow, colors.red)):
      print(color("%s..." % str(i + 1)))
      time.sleep(1)
  except KeyboardInterrupt:
    sys.exit(1)


class GCEPool(object):

  ''' Represents a pool of instances used in load balancing. '''

  def __init__(self, environment, group):

    ''' Accepts an ``environment`` and ``group`` pair for which this pool will
        match and activate/deactivate instances.

        :param environment: Node environment (usually ``sandbox``/``staging``/
          ``production``).

        :param group: Node group/role name, usually something like ``lb`` or
          ``app`` or ``db``. '''

    self.environment = environment
    self.group = group


class GCENode(object):

  ''' Class that provides a standard node object representing a catnip-managed
      node through the GCE libcloud provider. '''

  def __init__(self, node, driver):

    ''' Initialize this ``node`` with an underlying ``driver``.

        :param node: Target low-level GCE node that should be wrapped.

        :param driver: Driver to use for communication with APIs related to
          the target ``node`` to be wrapped. '''

    self.driver = driver
    self.node = node
    self.name = node.name
    self.ip = self.node.public_ips[0]
    self.private_ip = self.node.private_ips[0]
    self.tags = self.node.extra['tags']
    self._set_meta()

  def _set_meta(self):

    ''' Read metadata about a node, include its ``environment`` and
        ``group``. '''

    items = self.node.extra['metadata']['items']
    self.metadata = dict([(item['key'], item['value']) for item in items])
    self.group = self.metadata.get('group')
    self.environment = self.metadata.get('environment')


  @property
  def healthcheck_name(self):

    ''' Returns the name for a group's healthcheck.

        :returns: String name calculated for a node group's healthcheck
          configuration. '''

    return "check-" + self.group

  @property
  def targetpool_name(self):

    ''' Helper function to return unique name for targetpool / LB.

        :returns: String target pool name. '''

    name = (self.environment, '_', self.group, '_', self.driver.zone.name)
    return "".join(name).replace('_', '-')  # make the name safe for google

  def healthcheck_create(self):

    ''' Creates and returns a healthcheck for this pool.

        :returns: Created GCE healthcheck object. '''

    return self.driver.ex_create_healthcheck(self.healthcheck_name, host="fatcatmap.org",port="80")

  def targetpool_create(self):

    ''' Creates a targetpool and adds the appropriate healthcheck.

        :returns: Created pool. '''

    healthcheck = self.healthcheck_get()
    return self.driver.ex_create_targetpool(self.targetpool_name, healthchecks=[healthcheck])

  def healthcheck_get(self):

    ''' Returns a healthcheck object, creating one if it doesn't exist.

        :returns: Created healthcheck object. '''

    try:
      return self.driver.ex_get_healthcheck(self.healthcheck_name)
    except ResourceNotFoundError:
      print("healthcheck for group %s not found, creating...." % (self.group) )
      return self.healthcheck_create()

  def targetpool_get(self):

    ''' Returns a targetpool object, creating one if it doesnt exist.

        :returns: Created targetpool object. '''

    try:
      return self.driver.ex_get_targetpool(self.targetpool_name)
    except ResourceNotFoundError:
      print("targetpool not found, creating....")
      return self.targetpool_create()

  def targetpool_add(self):

    ''' Adds node to the targetpool. '''

    pool = self.targetpool_get()
    self.driver.ex_targetpool_add_node(pool, self.node)
    self.driver.ex_targetpool_add_healthcheck(pool, self.healthcheck_get())

  def targetpool_remove(self):

    ''' Removes a node from the targetpool. '''

    pool = self.targetpool_get()
    self.driver.ex_targetpool_remove_node(pool, self.node)

  def __repr__(self):

    ''' Generates string representation for a given compute node.

        :returns: Multiline, pretty-formatted string. '''

    return """

  Name: {name} - ({group})
  IP: {ip}/{private_ip}
  metadata:
    {metadata}

           """.format(

              name=self.name,
              ip=self.ip,
              private_ip=self.private_ip,
              group=self.group,
              node=self.node,
              metadata="\n\t".join([
                "%s: %s" % item for item in self.metadata.iteritems()
              ])
          )
