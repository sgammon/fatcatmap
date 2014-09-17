# -*- coding: utf-8 -*-

'''

  fabric: deploy tools
  ~~~~~~~~~~~~~~~~~~~~

'''

from __future__ import print_function

# stdlib
import os

from time import sleep

# local
from . import support
from . import helpers
from . import settings
#from .helpers import notify
from .support import service
from .helpers import get_node

# fabric
from fabric import colors, api
from fabric.api import env, task
from fabtools import require, deb


#@notify
@task
def bootstrap():

  ''' Prepare a newly-provisioned node with supporting software. Install,
      enable, and start services for any role-scoped services.'''
  node = get_node()

  if env.created:
    # if we just created the server wait a little bit
    sleep(10)

  ## ~~ app nodes ~~ ##
  if node.group == 'app':

    ## ~~ install apps ~~ ##
    fatcatmap(node.environment)

    ## ~~ start k9 ~~ ##
    api.sudo("/base/software/k9/sbin/k9"
             " --ini /base/software/k9/apphosting/master.ini")

  ## ~~ install services-n-stuff ~~ ##
  services = support.setup_for_group(group=node.group)

  ## ~~ start supporting services ~~ ##
  support.start(*services)


#@notify
@task
def fatcatmap(environment):

  ''' Install the ``catnip`` Python application and JS frontend for
      ``fatcatmap``, making use of the given Fabric ``environment``.

      :param environment: Active Fabric environment with target nodes and
        configuration. '''

  print(colors.yellow('Deploying fatcatmap on host %s...' % get_node()))
  helpers.pause()

  install_fcm = """

    cd /base/apps;
    gsutil cp gs://fcm-dev/%s/%s/app/latest.tar.gz - | tar -xvz;
    rm -fr /base/apps/fatcatmap/lib/python2.7 /base/apps/fatcatmap/bin;
    virtualenv --python=/usr/bin/python /base/apps/fatcatmap;

  """ % (environment, 'builds' if environment == 'sandbox' else 'releases')

  api.run(install_fcm)

  # fix permissions & install deps
  api.sudo("chown %s:%s -R /base/apps/fatcatmap" % (
    settings.USER, settings.GROUP))

  # correct permissions on binaries
  api.sudo("chmod +x /base/apps/fatcatmap/bin/*")

  # install pip requirements
  api.run("/base/apps/fatcatmap/bin/pip"
          " install -r /base/apps/fatcatmap/requirements.txt")

  # reload apps if any are running
  api.sudo("touch"
           " /base/ns/trigger/k9.reload"
           " /base/ns/trigger/apps/fatcatmap.reload")

  print(colors.green('~~~ fcm installed ~~~'))  # we done tho
