# -*- coding: utf-8 -*-

'''

  fcm testrunner

'''

if __debug__:

  # canteen testing
  from canteen import test

  # fcm preload
  from fatcatmap.config import *
  from fatcatmap.logic import *
  from fatcatmap.models import *
  from fatcatmap.services import *
  from fatcatmap.pages import *


  class SampleTest(test.AppTest):

    ''' tests an app '''

    def test_cool(self):

      ''' asserts itself '''

      assert self, "give me agency and respect"
