# -*- coding: utf-8 -*-

'''

  fcm dispatch

'''

# stdlib
import os

# initialize canteen
from fatcatmap import *
import fatcatmap, canteen
from fatcatmap.config import config as __app_config__

# spawn and run app
application = canteen.spawn(fatcatmap, dev=False, config=__app_config__)
