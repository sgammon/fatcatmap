# -*- coding: utf-8 -*-

'''

  fcm: commercial models

'''

# submodules
from . import (business,
               industry,
               nonprofit)

# symbols
from .business import *
from .industry import *
from .nonprofit import *


__all__ = ('business',
           'industry',
           'nonprofit')
