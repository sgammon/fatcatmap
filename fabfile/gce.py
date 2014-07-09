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
  SIZE_STR = settings.SIZE
  IMAGE_STR = settings.IMAGE
  NETWORK = settings.NETWORK
  node_class = GCENode  # used for cross-cloud compatability

  def __init__(self, environment="production", group="app", names=None):

    '''  '''

    if (group not in settings.ALLOWED_GROUPS) or (environment not in settings.ALLOWED_ENVIRONMENTS):
      raise Exception("invalid group or environment specified")
    self.names = names
    self.group = group
    self.environment = environment
    self._setup()

  def _setup(self):

    '''  '''

    driver = get_driver(Provider.GCE)
    self.driver = driver(self.ID, self.PEM, self.REGION, self.PROJECT)
    self.image = self.driver.ex_get_image(self.IMAGE_STR)
    self.size = self.driver.ex_get_size(self.SIZE_STR)

  def get_nodes(self):

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

    name = "{env}-{group}-{n}".format(group=self.group, env=self.environment, n=node_n)

    # create boot volume
    snapshot = settings.GROUP_SETTINGS[self.group].get('disk_snap', None)

    boot_kwargs = {
      'name': name,
      'location': self.REGION,
      'size': settings.GROUP_SETTINGS[self.group].get('disk_size', 10),
      'type': settings.GROUP_SETTINGS[self.group].get('disk_type', None)
    }

    if snapshot:
      boot_kwargs['snapshot'] = snapshot
    else:
      boot_kwargs['image'] = settings.GROUP_SETTINGS[self.group].get('image', settings.IMAGE)
    boot_volume = self.driver.create_volume(**boot_kwargs)

    # create node
    node = self.driver.create_node(
                     name=name,
                     image=self.image,
                     size=self.size,
                     location=self.REGION,
                     ex_tags=(
                      settings.GROUP_SETTINGS[self.group].get('tags', []) +
                      settings.ENV_TAGS[self.environment]
                     ),
                     ex_network=self.NETWORK,
                     ex_boot_disk=boot_volume,
                     ex_service_scopes=settings.GROUP_SETTINGS[self.group].get('services', []),
                     ex_boot_disk_auto_delete=True,
                     ex_metadata={
                      'group': self.group,
                      'environment': self.environment,
                      'startup-script-url': settings.STARTUP_SCRIPT_URL
                                  })
    print node

  def deploy_many(self, n=3):

    '''  '''

    for i in range(int(n)):
      self.deploy()
