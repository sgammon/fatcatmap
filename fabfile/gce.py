# -*- coding: utf-8 -*-

'''

  fabric: gce tools
  ~~~~~~~~~~~~~~~~~

'''

# libcloud and fabfile
import libcloud.security
from fabfile.helpers import GCENode
from libcloud.compute.types import Provider
from libcloud.compute.providers import get_driver
import settings



libcloud.security.CA_CERTS_PATH.append('/usr/local/etc/openssl/cert.pem')


class Deploy(object):

  '''  '''

  ##### Set defaults for Deploy #####
  ID = settings.PROJECT_ID
  PEM = settings.PEM
  PROJECT = settings.PROJECT
  REGION = settings.REGION
  IMAGE_STR = settings.IMAGE
  NETWORK = settings.NETWORK
  node_class = GCENode  # used for cross-cloud compatability

  def __init__(self, environment="production", group="app", names=None):

    '''  '''

    if (group not in settings.ALLOWED_GROUPS) or (environment not in settings.ALLOWED_ENVIRONMENTS):
      raise Exception("invalid group or environment specified")
    self.names = names
    self.group = group
    self.tags = settings.GROUP_TAGS.get(group) + settings.ENVIRONMENT_TAGS.get(environment)
    self.environment = environment
    self._setup()

  def _setup(self):

    '''  '''

    driver = get_driver(Provider.GCE)
    self.driver = driver(self.ID, self.PEM, self.REGION, self.PROJECT)
    self.image = self.driver.ex_get_image(self.IMAGE_STR)
    self.size = self.driver.ex_get_size(settings.GROUP_SETTINGS[self.group]['size'])

  def get_nodes(self,):

    ''' filters nodes and converts libcloud nodes into our node object as '''

    nodes = []
    iterator = (self.node_class(node) for node in self.driver.list_nodes())
    for node in iterator:
      if self.group and node.group == self.group:
        nodes.append(node)
      elif self.names and any(name in node.name for name in self.names):
          nodes.append(node)
    return nodes

  def deploy(self):

    '''  '''

    nodes = self.get_nodes()
    n = [int(node.name.split('-')[-1])
        for node in nodes if not node.node.state == 2]
    node_n = 1
    if len(n) > 0:
      node_n = max(n) + 1

    name = "{env}-{group}-{n}".format(
      group=self.group,
      env=settings.GROUP_LABELS.get(self.environment),
      n=node_n
    )

    # create boot disk
    boot_volume = self.driver.create_volume(
          name=name,
          size=settings.BOOT_DISK_SIZE,
          location=self.REGION,
          snapshot=settings.BOOT_DISK_SNAPSHOT,
          use_existing=False,
          type=settings.BOOT_DISK_TYPE
    )

    print "Made boot volume for '%s'." % name

    # create node
    node = self.driver.create_node(
          name=name,
          size=self.size,
          image=self.image,
          ex_tags=self.tags,
          location=self.REGION,
          ex_boot_disk=boot_volume,
          ex_ip_forwarding=settings.GROUP_SETTINGS[self.group]['ip_forwarding'],
          ex_service_scopes=settings.GROUP_SETTINGS[self.group]['service_scopes'],
          ex_network=self.NETWORK,
          ex_metadata={
            'group': self.group,
            'environment': self.environment,
            'startup-script-url': settings.STARTUP_SCRIPT_URL
          }
    )

    print "Made node '%s'." % name
    print node

  def deploy_many(self, n=3):

    '''  '''

    for i in range(int(n)):
      self.deploy()
