from . import ModelBinding, bind





@bind('bigquery', 'Node')
class NodeConverter(ModelBinding):

  ''' Converts instances of the old ``Node`` model into new
   	  ``Vertex`` records. '''

  # {u'label': u'Norman_Sisisky_legacy', u'native': u'OkxlZ2lzbGF0b3I6Tm9ybWFuX1Npc2lza3lfbGVnYWN5'}

  def convert(self, data):

  	''' Convert legacy data into the target entity.

  		:param data: ``dict`` of data to convert.
  		:returns: Instance of local target to inflate. '''

  	self.logging.info('----> Converting `Node`...')
  	self.logging.info(str(data))
  	return data