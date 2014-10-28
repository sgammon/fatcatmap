# -*- coding: utf-8 -*-

'''

  fcm testrunner

'''

if __debug__:

  # stdlib
  import os
  import json

  # canteen testing
  from canteen import test
  from canteen.model import Model

  # fcm preload
  from fatcatmap.logic import *
  from fatcatmap.models import *
  from fatcatmap.services import *
  from fatcatmap.pages import *

  # logging
  from canteen.util.debug import Logger

  # fcm config & base model
  from fatcatmap.models import BaseModel
  from fatcatmap.config import project as root
  from fatcatmap.config import config as appconfig

  # builtin adapter
  from fatcatmap.logic.db.adapter import RedisWarehouse


  # allow logging
  logger = Logger('fcm-testsuite')

  # install application config and set adapter
  test.BaseTest.set_config(appconfig)
  BaseModel.__adapter__ = RedisWarehouse.acquire(*(
    'BaseModel', BaseModel.__bases__, {}))


  class SampleTest(test.AppTest):

    ''' tests an app '''

    def test_cool(self):

      ''' asserts itself '''

      assert self, "give me agency and respect"
