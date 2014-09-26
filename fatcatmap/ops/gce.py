# -*- coding: utf-8 -*-

'''

  fcm ops: gce tools

'''

from __future__ import print_function

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
  node_class = GCENode  # used for cross-cloud compatability

  def __init__(self, environment, group, region=settings.DEFAULT_REGION, names=None):

    ''' Initialize this ``Deploy`` flow, given a Fabric Python ``environment``,
        an instance role (called a ``group``), and a GCE ``region``.

        :param environment: Fabric environment for the current ops flow.

        :param group: Instance role name, defined in ``config.py``.

        :param region: GCE region to deploy to, defaults to
          ``settings.DEFAULT_REGION``.

        :param names: Instance names to filter by. Iterable of strings.

        :raises TypeError: In the event of an unknown or invalid ``group``,
          ``environment`` or ``region`` value. Groups are derived from the
          *infrastructure* config block in ``appconfig.py``, and known/enabled
          regions and environments are also outlined there.

        :raises RuntimeError: On the other hand, if an instance role (or
          ``group``) is *restricted explicitly or implicitly* via the
          ``restrictions`` block in the role config (either via an
          ``environments`` or ``regions`` restriction), a ``RuntimeError``
          is raised describing the situation. '''

    if group not in settings.ALLOWED_GROUPS:
      raise TypeError("invalid or unkown group specified: '%s'" % group)

    if environment not in settings.ALLOWED_ENVIRONMENTS:
      raise TypeError("invalid or unkown environment specified: '%s'" % environment)

    if region not in settings.ENABLED_REGIONS:
      raise TypeError("invalid or unkown region specified: '%s'" % region)

    # setup instance vars
    self.names = names
    self.group = group
    self.region = region
    self.environment = environment

    # initialize driver
    driver = get_driver(Provider.GCE)

    self.driver = driver(self.ID, self.PEM, self.region, self.PROJECT)
    self.image = self.driver.ex_get_image(self.config['image'])
    self.size = self.driver.ex_get_size(self.config['size'])

    # enforce restrictions
    if 'restrictions' in self.config:
      if 'environments' in self.config['restrictions']:
        if environment not in self.config['restrictions']['environments']:
          raise RuntimeError('Instance role type %s is not supported'
                             ' in requested environment %s.' % (
                                group, environment))

      if 'regions' in self.config['restrictions']:
        if region not in self.config['restrictions']['regions']:
          raise RuntimeError('Instance role type %s is not supported'
                             ' in requested region %s.' % (
                                group, region))

  @property
  def config(self):

    ''' Retrieve configuration for the current instance role.

        :returns: ``dict`` of instance role (or ``group``) configuration. '''

    return settings.GROUP_SETTINGS[self.group]

  def get_nodes(self, all_regions=False):

    ''' Filters nodes and converts libcloud nodes into our node object.

        :param all_regions: Iterate over all nodes from all known/enabled GCE
          regions (configuratble in ``config.py``).

        :returns: Matching nodes, according to input parameters and current
          state in GCE. '''

    driver = get_driver(Provider.GCE)

    nodes = []
    if all_regions:
      regions = settings.ENABLED_REGIONS
    else:
      regions = [self.region]
    for region in regions:
      _driver = driver(self.ID, self.PEM, region, self.PROJECT)
      iterator = (self.node_class(node, _driver) for node in _driver.list_nodes())
      for node in iterator:
        if self.group and node.group == self.group:
          nodes.append(node)
        elif self.names and any(name in node.name for name in self.names):
          nodes.append(node)
    return nodes

  def deploy(self):

    ''' Perform a full *deploy flow*, which consists of creating a desired
        count (``n``) of instances or enough instances up to a limit (``l``) for
        a given role (``group``) and ``environment``.

        Available ``groups``/roles (varies by config, typical case here):
        - ``lb`` - load balancer role for routing traffic
        - ``app`` - appserver role for serving traffic
        - ``db`` - database role for serving data to appservers

        Available ``environments`` include:
        - ``sandbox`` - for development and one-off/general tasks
        - ``staging`` - for testing feature work, RC or production builds
        - ``production`` - full live production, *baby* '''

    nodes = self.get_nodes(all_regions=True)
    n = [int(node.name.split('-')[-1])
        for node in nodes if not node.node.state == 2]
    node_n = 1
    if len(n) > 0:
      node_n = max(n) + 1

    name = "{env}-{group}-{n}".format(group=self.group, env=self.environment, n=node_n)

    # create boot volume
    print(colors.yellow('Creating boot volume "%s"...' % '-'.join((name, 'boot'))))
    snapshot = self.config.get('disk', {}).get('snap', None)

    disktype = self.config.get('disk', {}).get('type', None)
    if disktype:
      disktype = (
        "https://www.googleapis.com/compute/v1/projects/%s/zones/%s/diskTypes/" % (self.PROJECT, self.region)
      ) + disktype

    boot_kwargs = {
      'name': '-'.join((name, 'boot')),
      'location': self.region,
      'size': self.config.get('disk', {}).get('size', 10),
      'type': disktype}

    if snapshot:
      boot_kwargs['snapshot'] = snapshot
    else:
      boot_kwargs['image'] = self.config['image']
    boot_volume = self.driver.create_volume(**boot_kwargs)
    print(colors.green('Volume created: %s' % boot_volume))

    # create node
    print(colors.yellow('Creating node "%s" of size "%s"...' % (name, self.config['size'])))

    tags = settings.GROUP_SETTINGS[self.group].get('tags', set()) | \
        settings.ENV_TAGS[self.environment].get('tags',set()) | \
        self.config.get('tags', set())

    node = self.driver.create_node(
                     name=name,
                     size=self.config['size'],
                     image=self.config['image'],
                     location=self.region,
                     ex_tags=list(tags),
                     ex_network=self.environment,
                     ex_boot_disk=boot_volume,
                     ex_service_scopes=self.config.get('scopes', []),
                     ex_boot_disk_auto_delete=True,
                     ex_metadata={'group': self.group,
                                  'environment': self.environment,
                                  'startup-script-url': (
                                    settings.DEFAULT_STARTUP_SCRIPT_URL)})
    print(colors.green('Node created: %s' % node))
    return name

  def deploy_many(self, n=3):

    ''' Batch version of ``deploy``, which accepts a count of instances to
        deploy (``n``).

        :param n: Count of instances to deploy via ``deploy``. '''

    names = []

    for i in range(int(n)):
      names.append(self.deploy())

    return names
