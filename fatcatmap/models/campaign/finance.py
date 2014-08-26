# -*- coding: utf-8 -*-

'''

  fcm: campaign finance models

'''

# graph models
from .. import (date,
                Vertex,
                describe)

# abstract models
from ..abstract import (URI,
                        Role,
                        Organization,
                        CurrencyTransaction)

# parent models
from ..person import Person
from ..social.campaign import Campaign


@describe(parent=(Person, Organization), type=Role)
class Contributor(Vertex):

  ''' Represents a Contributor from the :py:mod:`fatcatmap` graph. '''

  ## -- naming / categorization -- ##
  fec_category = str, {'indexed': True}


@describe(type=CurrencyTransaction)
class CampaignContribution(Contributor >> Campaign):

  ''' Describes a monetary contribution made from a ``Contributor`` to a
      ``Campaign``. '''

  ## -- contribution data -- ##
  cycle = int, {'indexed': True, 'choices': xrange(1900, 2014)}
  namespace = str, {'indexed': True, 'choices': {
      'urn:fec:transaction', 'urn:nimsp:transaction'}}

  ## -- original data -- ##
  filing = URI, {'indexed': True}
  document = URI, {'indexed': True}

  ## -- time -- ##
  filed = date, {'indexed': True}
  revised = date, {'indexed': True}
