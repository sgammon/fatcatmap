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
  from fatcatmap.logic.db.adapter import (InMemoryWarehouse,
                                          RedisWarehouse)


  # allow logging
  logger = Logger('fcm-testsuite')

  # install application config and set adapter
  test.BaseTest.set_config(appconfig)
  BaseModel.__adapter__ = RedisWarehouse.acquire(*(
    'BaseModel', BaseModel.__bases__, {}))

  # load fixtures and set adapter
  try:
    ## open and read fixture data
    with open(os.path.join(root, '.fixtures.json')) as fixture_data:
      fixtures = json.loads(fixture_data.read())

    InMemoryWarehouse.load_fixtures(**fixtures)

  except:
    logger.error('Failed to read fixture data for testing.')


  class SampleTest(test.AppTest):

    ''' tests an app '''

    def test_cool(self):

      ''' asserts itself '''

      assert self, "give me agency and respect"

    def test_get_homepage(self):

      ''' basic homepage fetch '''

      assert self.GET('/')
