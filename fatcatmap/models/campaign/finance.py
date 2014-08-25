# -*- coding: utf-8 -*-

'''

    fcm: campaign finance models

'''

# stdlib
import datetime

# graph models
from .. import date
from .. import Edge
from .. import Vertex
from .. import describe

# parent models
from ..person import Person
from ..abstract import URI
from ..abstract import Role
from ..abstract import Organization
from ..social.campaign import Campaign


@describe(parent=(Person, Organization), type=Role)
class Contributor(Vertex):

  ''' Represents a Contributor from the :py:mod:`fatcatmap` graph. '''

  # -- naming / categorization -- #
  fec_category = str, {'indexed': True}


class Contribution(Contributor >> Campaign):

  ''' Describes a monetary contribution made from a ``Contributor`` to a
      ``Campaign``. '''

  ## -- money -- ##
  amount = float, {'indexed': True}
  cycle = int, {'indexed': True, 'choices': xrange(1900, 2014)}
  namespace = str, {'indexed': True, 'choices': {
      'urn:fec:transaction', 'urn:nimsp:transaction'}}

  ## -- original data -- ##
  filing = URI, {'indexed': True}
  document = URI, {'indexed': True}

  ## -- time -- ##
  filed = date, {'indexed': True}
  revised = date, {'indexed': True}
  occurred = date, {'indexed': True}
