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
from .settings import ALLOWED_GROUPS, ALLOWED_ENVIRONMENTS


libcloud.security.CA_CERTS_PATH.append('/usr/local/etc/openssl/cert.pem')


class Deploy(object):

  '''  '''

  ID = '489276160057-dffvig7s5uoqg0em72ndnsuvc72jb6m6@developer.gserviceaccount.com'
  PEM = 'fabfile/credentials/identity.pem'
  PROJECT = 'fcm-catnip'

  REGION = 'us-central1-a'
  SIZE_STR = 'g1-small'
  IMAGE_STR = 'debian-7-wheezy-v20140606'

  node_class = GCENode  # used for cross-cloud compatability

  def __init__(self, environment="prod", group="web", names=None):

    '''  '''

    if (group not in ALLOWED_GROUPS) or (environment not in ALLOWED_ENVIRONMENTS):
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

    name = "{group}-{env}-{n}".format(group=self.group, env=self.environment, n=node_n)
    node = self.driver.create_node(name=name,
                     image=self.image, size=self.size,
                     ex_metadata={'group': self.group, 'environment': self.environment})
    print node

  def deploy_many(self, n=3):

    '''  '''

    for i in range(int(n)):
      self.deploy()
