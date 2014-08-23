# -*- coding: utf-8 -*-

'''

  fcm: legislative committee membership models

'''


# canteen models
from fatcatmap.models import Edge


class CommitteeMembership(Edge):

  ''' Edge representing a legislator's membership on a legislative
      committe. '''

  # -- references -- #
  committee = basestring, {'indexed': True, 'required': True}
  legislator = basestring, {'indexed': True, 'required': True}

  # -- external IDs -- #
  govtrackid = basestring, {'indexed': True}

  # -- categorization & naming -- #
  committee_type = basestring, {'indexed': True}
  name = basestring, {'indexed': True}
  subname = basestring, {'indexed': True}
  role = basestring, {'indexed': True}

  # -- internal codes -- #
  housecode = basestring, {'indexed': True}
  senatecode = basestring, {'indexed': True}
