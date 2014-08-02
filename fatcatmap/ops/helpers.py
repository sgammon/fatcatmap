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
from dogapi.fab import setup
from dogapi.fab import notify
setup(settings.DATADOG_KEY)


def get_node():

  '''  '''

  return env.hosts_detail[env.host]


def pause():

  '''  '''

  try:
    for i, color in zip(reversed(xrange(3)), (colors.green, colors.yellow, colors.red)):
      print(color("%s..." % str(i + 1)))
      time.sleep(1)
  except KeyboardInterrupt:
    sys.exit(1)


class GCEPool(object):

  '''  '''

  def __init__(self, environment, group):

    '''  '''

    self.environment = environment
    self.group = group


class GCENode(object):

  ''' Class that provides a standard node object for the GCE libcloud provider '''

  def __init__(self, node, driver):

    '''  '''
    self.driver = driver
    self.node = node
    self.name = node.name
    self.ip = self.node.public_ips[0]
    self.private_ip = self.node.private_ips[0]
    self.tags = self.node.extra['tags']
    self._set_meta()

  def _set_meta(self):

    '''  '''

    items = self.node.extra['metadata']['items']
    self.metadata = dict([(item['key'], item['value']) for item in items])
    self.group = self.metadata.get('group')
    self.environment = self.metadata.get('environment')


  @property
  def healthcheck_name(self):
    ''' returns the name for a groups healthcheck '''
    return "check-" + self.group

  @property
  def targetpool_name(self):

    '''Helper function to return unique name for targetpool / LB '''

    name = (self.environment, '_', self.group, '_', self.driver.zone.name)
    return "".join(name).replace('_', '-')  # make the name safe for google

  def healthcheck_create(self):

    ''' creates and returns a healthcheck for this pool'''

    return self.driver.ex_create_healthcheck(self.healthcheck_name,host="fatcatmap.org",port="80")

  def targetpool_create(self):

    ''' creates a targetpool and adds the appropriate healthcheck '''
    healthcheck = self.healthcheck_get()
    pool = self.driver.ex_create_targetpool(self.targetpool_name,healthchecks=[healthcheck])
    return pool

  def healthcheck_get(self):

    ''' returns a healthcheck object creating one if it doesn't exist '''

    try:
      return self.driver.ex_get_healthcheck(self.healthcheck_name)
    except ResourceNotFoundError:
      print("healthcheck for group %s not found, creating...." % (self.group) )
      return self.healthcheck_create()

  def targetpool_get(self):

    ''' returns a targetpool object creating one if it doesnt exist '''

    try:
      return self.driver.ex_get_targetpool(self.targetpool_name)
    except ResourceNotFoundError:
      print("targetpool not found, creating....")
      return self.targetpool_create()

  def targetpool_add(self):

    ''' adds node to targetpool  '''

    pool = self.targetpool_get()
    self.driver.ex_targetpool_add_node(pool, self.node)
    self.driver.ex_targetpool_add_healthcheck(pool,self.healthcheck_get())

  def targetpool_remove(self):

    '''  '''

    pool = self.targetpool_get()
    self.driver.ex_targetpool_remove_node(pool, self.node)

  def __repr__(self):

    '''  '''

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
