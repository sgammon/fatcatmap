from fabric import colors
from fabric.api import env
from fabric.api import task
from fabric.api import run,sudo

from fabtools import require,service


@task
def service(name,action="restart"):
    sudo("service {0} {1}".format(name,action))

