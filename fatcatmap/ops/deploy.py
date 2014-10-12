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
from .helpers import notify
from .support import service
from .helpers import get_node

# fabric
from fabric import colors, api
from fabric.api import env, task,hide
from fabtools import require, deb
from fabric.api import settings as f_settings


def is_finished():

  ''' @todo fix base image to not have ghost startup script run and figure out better error handling'''

  command = 'grep -v "Aug 23 09:01:46 bullpen-sandbox startupscript: Finished" /var/log/startupscript.log | ' \
            'grep "Finished running startup"'

  for i in xrange(30):
    with hide('warnings'), f_settings(warn_only=True,):
      output = api.sudo(command)

      if "Finished running startup" in output:
        print(colors.green("node finished running startup script"))
        print(colors.yellow(output))
        return True

      elif any((word in output.lower() for word in ["error","failed"])): #@todo this won't run currently
        print(colors.red("oops sam fucked up"))
        return False

    print(colors.yellow("Instance booting..."))
    sleep(10)

@notify
@task
def bootstrap():

  ''' Prepare a newly-provisioned node with supporting software. Install,
      enable, and start services for any role-scoped services.'''

  if not is_finished():
    print(colors.red("unable to bootstrap, startup script failed"))
    return

  node = get_node()

  ## ~~ app nodes ~~ ##
  if node.group == 'app':

    ## ~~ install apps ~~ ##
    print(colors.yellow('Installing fatcatmap...'))
    fatcatmap(node.environment)

    ## ~~ start k9 ~~ ##
    print(colors.yellow('Starting K9...'))
    api.sudo("/base/software/k9/sbin/k9"
             " --ini /base/software/k9/apphosting/master.ini")

  ## ~~ install services-n-stuff ~~ ##
  print(colors.yellow('Installing services for group %s...' % node.group))
  support.setup_for_group(group=node.group)

  print(colors.green('Deploy succeeded.'))

@notify
@task
def update():

  ''' Update existing servers with a new version of fatcatmap. '''

  from .provision import activate, deactivate

  node = get_node()

  if node.group == 'app':

    deactivate()

    print(colors.yellow('Performing update...'))
    helpers.pause()
    fatcatmap(node.environment)

    print(colors.yellow('Activating...'))
    helpers.pause()
    activate()

  print(colors.green('Update complete.'))


@notify
@task
def fatcatmap(environment):

  ''' Install the ``catnip`` Python application and JS frontend for
      ``fatcatmap``, making use of the given Fabric ``environment``.

      :param environment: Active Fabric environment with target nodes and
        configuration. '''

  print(colors.yellow('Deploying fatcatmap on host %s...' % get_node()))

  tarball = "gs://fcm-dev/%s/%s/app/latest.tar.gz" % (
    environment, 'builds' if environment == 'sandbox' else 'releases')

  install_fcm = """

    cd /base/apps;
    rm -fr /base/apps/fatcatmap/*;
    gsutil cp %s - | tar -xvz;
    rm -fr /base/apps/fatcatmap/lib/python2.7 /base/apps/fatcatmap/bin/{python,python2.7,pip};
    virtualenv --python=/usr/bin/python /base/apps/fatcatmap;
    pushd /base/apps/fatcatmap;

  """ % tarball

  print(colors.yellow('Using tarball %s...' % tarball))
  helpers.pause()

  api.run(install_fcm)

  # fix permissions & install deps
  api.sudo("chown %s:%s -R /base/apps/fatcatmap" % (
    settings.USER, settings.GROUP))

  # correct permissions on binaries
  api.sudo("chmod +x /base/apps/fatcatmap/bin/*")

  # install pip requirements
  api.run("/base/apps/fatcatmap/bin/pip"
          " install -r /base/apps/fatcatmap/requirements.txt")
  api.run("/base/apps/fatcatmap/bin/pip"
          " install -r /base/apps/fatcatmap/lib/canteen/requirements.txt")

  # rebuild templates
  api.run("/base/apps/fatcatmap/bin/python -OO"
          " /base/apps/fatcatmap/scripts/fcm.py build --templates")

  # startup redis
  print(colors.yellow('Starting ephemeral Redis instance...'))
  api.sudo("rm -f /base/data/redis/*.aof /base/data/redis/*.rdb")
  api.sudo("/usr/local/bin/redis-server"
           " /etc/redis/db.conf")

  # update data
  api.run("/base/apps/fatcatmap/bin/python -OO"
          " /base/apps/fatcatmap/scripts/fcm.py migrate --clean --update")

  print(colors.yellow('Snapshotting Redis data...'))
  api.run("/usr/local/bin/redis-cli -h localhost config set appendonly yes")
  api.run("/usr/local/bin/redis-cli -h localhost bgaofrewrite")
  helpers.pause()

  print(colors.yellow('Shutting down ephemeral Redis instance...'))
  api.run("/usr/local/bin/redis-cli -h localhost shutdown")

  # reload apps if any are running
  api.sudo("touch"
           " /base/ns/trigger/k9.reload"
           " /base/ns/trigger/apps/fatcatmap.reload")

  print(colors.green('~~~ fcm installed ~~~'))  # we done tho
