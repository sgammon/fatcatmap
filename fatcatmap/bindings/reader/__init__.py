# -*- coding: utf-8 -*-

'''

  fcm: binding readers

'''

# submodules
from . import csv
from . import base

reader = base.reader


__all__ = ('csv',
           'base',
           'reader')
