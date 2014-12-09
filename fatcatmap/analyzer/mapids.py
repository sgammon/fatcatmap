from fatcatmap.models.descriptors.ext import ExternalID



class ExternalIDMapper(object):

  def __init__(self):
    pass

  def load(self):
    self.ids = ExternalID.query().fetch()


  def map(self):
    content = {id.content[0]:
                  {'parent': id.parent, 'kind': id.parent.kind,
                   'provider': id.parent.kind } for id in self.ids}



ids = ExternalID.query().fetch()
content = {id.content[0]:
                  {'parent': id.key.parent,
                   'provider': id.provider } for id in ids}