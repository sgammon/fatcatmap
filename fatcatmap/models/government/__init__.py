# -*- coding: utf-8 -*-

'''

  fcm: government models

'''

# submodules
from . import (judicial,
               executive,
               legislative)

# symbols
from .judicial import *
from .executive import *
from .legislative import *


__all__ = ('judicial',
           'executive',
           'legislative')
