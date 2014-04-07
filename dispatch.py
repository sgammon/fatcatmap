# -*- coding: utf-8 -*-

'''

  fcm dispatch

'''

# stdlib
import os

# initialize canteen
from fatcatmap import *
import fatcatmap, canteen;

# spawn and run app
application = canteen.spawn(fatcatmap, dev=False, config=fatcatmap.config)
