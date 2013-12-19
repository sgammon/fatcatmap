# -*- coding: utf-8 -*-

'''

    fatcatmap graph models: nodes


    :author: Alexander Rosner <alex@momentum.io>
    :copyright: (c) momentum labs, 2013

'''


# STD lib
import datetime

# canteen
from canteen import model

from fatcatmap.models import AppModel


# Edge - represents a relationship between two nodes on the Graph.
class Edge(AppModel):

    ''' Represents a single Edge on the :py:mod:`fatcatmap`
        graph '''

    # Edge Data
    label = basestring, {'indexed': True, 'required': False, 'verbose_name': 'Label'}
    node = basestring, {'indexed': True, 'repeated': True, 'verbose_name':'Nodes'}
    native = basestring, {'indexed': True, 'required': False, 'verbose_name':'Native'}
    # data = model.BlobKey, {'indexed': True, 'required': False, 'verbose_name': 'Data'}
    #Timestamps
    #modified = DateTimeProperty, {'indexed':True, 'auto_now': True}
    #created = DateTimeProperty, {'indexed': True, 'auto_now_add':True}
