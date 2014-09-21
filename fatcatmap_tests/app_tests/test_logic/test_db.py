# -*- coding: utf-8 -*-

'''

  fcm: db logic tests

'''

## db logic tests
from fatcatmap.logic.db import adapter

# canteen testsuites
from canteen_tests.test_adapters import test_redis
from canteen_tests.test_adapters import test_abstract


class WarehouseTests(test_abstract.DirectedGraphAdapterTests):

  '''  '''

  __abstract__, subject = True, adapter.WarehouseAdapter


class RedisWarehouseTests(WarehouseTests, test_redis.RedisSetupTeardown):

  '''  '''

  __abstract__ = False
  subject = adapter.RedisWarehouse
  mode = adapter.RedisWarehouse.EngineConfig.mode
