# -*- coding: utf-8 -*-

'''

    fatcatmap graph models: edges

    :author: Sam Gammon <sam@momentum.io>
    :author: Alexander Rosner <alex@momentum.io>
    :copyright: (c) momentum labs, 2013
    :license: The inspection, use, distribution, modification or implementation
              of this source code is governed by a private license - all rights
              are reserved by the Authors (collectively, "momentum labs, ltd")
              and held under relevant California and US Federal Copyright laws.
              For full details, see ``LICENSE.md`` at the root of this project.
              Continued inspection of this source code demands agreement with
              the included license and explicitly means acceptance to these terms.

'''


# STD lib
import datetime

# canteen
from canteen import model

from fatcatmap.models import AppModel


# Node - represents a node on the Graph.
class Node(AppModel):

    ''' Represents a single Node on the :py:mod:`fatcatmap`
        graph. '''

    # Node Data
    label = basestring, {'indexed': True, 'required': True, 'verbose_name': 'Label'}
    native = basestring, {'indexed' : True, 'required': False, 'default' : None, 'verbose_name':'Native'}
    # data = model.BlobKey,{ 'indexed': True, 'required':False, 'verbose_name':'Data'}

    # Timestamps
    modified = datetime, {'indexed': True, 'auto_now':True }
    created = datetime, { 'indexed': True, 'auto_now_add':True }
