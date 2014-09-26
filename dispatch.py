# -*- coding: utf-8 -*-

'''

  fcm dispatch

'''

# stdlib
import os

# initialize canteen
from fatcatmap import *
import fatcatmap, canteen
from fatcatmap.config import config as appconfig

# sentry integration
from raven import Client
from raven.middleware import Sentry
client = Client(appconfig.app['credentials']['sentry']['endpoint'])

# spawn and run app
application = Sentry(canteen.spawn(fatcatmap,
  config=appconfig), client=client)
