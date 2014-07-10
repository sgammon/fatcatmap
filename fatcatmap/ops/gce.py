# -*- coding: utf-8 -*-

'''

  fcm ops: gce tools

'''

# local
from . import settings
from .helpers import GCENode

# libcloud + fabric
from fabric import colors
from libcloud import security
from libcloud.compute.types import Provider
from libcloud.compute.providers import get_driver


## Globals
security.CA_CERTS_PATH.append('/usr/local/etc/openssl/cert.pem')


class Deploy(object):

  ''' Object that tracks a deploy. '''

  ##### Set defaults for Deploy #####
  ID = settings.PROJECT_ID
  PEM = settings.PEM
  PROJECT = settings.PROJECT
  REGION = settings.REGION
  node_class = GCENode  # used for cross-cloud compatability

  def __init__(self, environment, group, names=None):

    '''  '''

    if (group not in settings.ALLOWED_GROUPS) or (environment not in settings.ALLOWED_ENVIRONMENTS):
      raise Exception("invalid group or environment specified")
    self.names = names
    self.group = group
    self.environment = environment
    self._setup()

  @property
  def config(self):

    '''  '''

    return settings.GROUP_SETTINGS[self.group]

  def _setup(self):

    '''  '''

    driver = get_driver(Provider.GCE)
    self.driver = driver(self.ID, self.PEM, self.REGION, self.PROJECT)
    self.image = self.driver.ex_get_image(self.config['image'])
    self.size = self.driver.ex_get_size(self.config['size'])

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
    print colors.yellow('Creating boot volume "%s"...' % '-'.join((name, 'boot')))
    snapshot = self.config.get('disk', {}).get('snap', None)

    boot_kwargs = {
      'name': '-'.join((name, 'boot')),
      'location': self.REGION,
      'size': self.config.get('disk', {}).get('size', 10),
      'type': self.config.get('disk', {}).get('type', None)
    }

    if snapshot:
      boot_kwargs['snapshot'] = snapshot
    else:
      boot_kwargs['image'] = self.config['image']
    boot_volume = self.driver.create_volume(**boot_kwargs)
    print colors.green('Volume created: %s' % boot_volume)

    # create node
    print colors.yellow('Creating node "%s" of size "%s"...' % (name, self.config['size']))
    node = self.driver.create_node(
                     name=name,
                     size=self.config['size'],
                     image=self.config['image'],
                     location=self.REGION,
                     ex_tags=(
                      settings.GROUP_SETTINGS[self.group].get('tags', []) +
                      settings.ENV_TAGS[self.environment]
                     ),
                     ex_network=self.environment,
                     ex_boot_disk=boot_volume,
                     ex_service_scopes=self.config.get('scopes', []),
                     ex_boot_disk_auto_delete=True,
                     ex_metadata={'group': self.group,
                                  'environment': self.environment,
                                  'startup-script-url': settings.STARTUP_SCRIPT_URL})
    print colors.green('Node created: %s' % node)

  def deploy_many(self, n=3):

    '''  '''

    for i in range(int(n)):
      self.deploy()