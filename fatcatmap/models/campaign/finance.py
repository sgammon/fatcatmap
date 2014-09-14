# -*- coding: utf-8 -*-

'''

  fcm: campaign finance models

'''

# graph models
from .. import (date,
                Model,
                Vertex,
                describe)

# abstract models
from ..abstract import (URI,
                        Role,
                        Stat,
                        StatValue,
                        Organization,
                        CurrencyTransaction)

# parent models
from ..person import Person
from ..politics.campaign import Campaign

# canteen structs
from canteen.util.struct import BidirectionalEnum


@describe(parent=(Person, Organization), type=Role)
class Contributor(Vertex):

  ''' Represents a Contributor from the :py:mod:`fatcatmap` graph. '''

  ## -- naming / categorization -- ##
  fec_category = str, {'indexed': True}


@describe(type=CurrencyTransaction)
class CampaignContribution(Contributor >> Campaign):

  ''' Describes a monetary contribution made from a ``Contributor`` to a
      ``Campaign``. '''

  class ContributionType(BidirectionalEnum):

    ''' Maps FEC contribution type codes. '''

    pass

  ## -- contribution data -- ##
  type = ContributionType, {'indexed': True, 'required': True}
  cycle = int, {'indexed': True, 'choices': xrange(1900, 2014)}
  namespace = str, {'indexed': True, 'choices': {
      'urn:fec:transaction', 'urn:nimsp:transaction'}}

  transaction_type = str, {'indexed': True}

  ## -- original data -- ##
  filing = URI, {'indexed': True}
  document = URI, {'indexed': True}

  ## -- time -- ##
  filed = date, {'indexed': True}
  revised = date, {'indexed': True}


@describe(type=Stat, descriptor=True, keyname=True)
class ContributorStats(Model):

  '''  '''

  # keyname: transaction type

  count = StatValue, {'indexed': True, 'embedded': True}
  total = StatValue, {'indexed': True, 'embedded': True}


@describe(type=Stat, descriptor=True, keyname=True)
class RecipientStats(Model):

  '''  '''

  # keyname: transaction type

  count = StatValue, {'indexed': True, 'embedded': True}
  total = StatValue, {'indexed': True, 'embedded': True}
