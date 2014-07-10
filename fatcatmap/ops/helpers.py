# -*- coding: utf-8 -*-

'''

  fabric: helpers
  ~~~~~~~~~~~~~~~

'''

# fabric
from fabric.api import env


def get_node():

  '''  '''

  return env.hosts_detail[env.host]


class GCENode(object):

  ''' Class that provides a standard node object for the GCE libcloud provider '''

  def __init__(self, node):

    '''  '''

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
