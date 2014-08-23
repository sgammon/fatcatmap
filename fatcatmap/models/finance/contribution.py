# -*- coding: utf-8 -*-

'''

  fcm: financial contributions models

'''


# graph models
from fatcatmap.models import Edge


class Contribution(Edge):

  ''' Represents a single Contribution between a :py:class:`Contributor` and a
      :py:class:`Recipient` on the :py:mod:`fatcatmap` graph. '''

  # -- details -- #
  cycle = int, {'indexed': True}
  total = float, {'indexed': True}

  # -- naming -- #
  recipient_name = str, {'indexed': True}
  contributor_name = str, {'indexed': True}
