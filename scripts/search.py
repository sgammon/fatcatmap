# -*- coding: utf-8 -*-

'''

  fcm: search tools

'''

import sys
import os

project_root = os.path.abspath(os.path.dirname(os.path.dirname(__file__)))
sys.path.insert(0, project_root)
sys.path.insert(0, os.path.join(project_root, 'lib'))
sys.path.insert(0, os.path.join(project_root, 'lib/canteen'))
sys.path.insert(0, os.path.join(project_root, 'fatcatmap'))
sys.path.insert(0, os.path.join(project_root, 'fatcatmap/lib'))

# canteen util
from canteen.util import cli
import fatcatmap
from fatcatmap.logic.search.indexer import Indexer



class Search(cli.Tool):

  '''  '''

  def execute(arguments):

    '''  '''

    print 'hello'
    #print arguments.source




if __name__ == '__main__':
  from canteen.core.meta import Proxy
  indexer = Proxy.Component.singleton_map['Indexer']
  #indexer.delete_index()
  indexer.index_all()