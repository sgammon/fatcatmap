# -*- coding: utf-8 -*-

'''

  fabric: services
  ~~~~~~~~~~~~~~~~

'''

# fabric
from fabric.api import env, task, run, sudo


@task
def service(name, action="restart"):

  '''  '''

  sudo("service {0} {1}".format(name, action))
