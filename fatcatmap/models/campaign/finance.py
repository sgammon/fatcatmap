# -*- coding: utf-8 -*-

'''

  fcm: campaign finance_categories models

'''

# graph models
from .. import (date,
                Vertex,
                describe)

# abstract models
from ..abstract import (Role,
                        Stat,
                        Transaction,
                        Organization)


# parent models
from ..person import Person
from ..politics.campaign import Campaign
from ..politics.committee import PoliticalCommittee

# descriptors
from ..descriptors.ext import URI
from ..descriptors.stat import (RankedStatValue,
                                CategoricalStatValue)

# canteen structs
from canteen.util.struct import BidirectionalEnum


@describe(parent=Vertex, type=Role)
class Contributor(Vertex):

  ''' Represents a financial support role that a ``Person`` or
      ``Corporation`` can assume in a campaign politics context. '''

  ## -- naming / categorization -- ##
  fec_category = str, {'indexed': True}


class ContributionType(BidirectionalEnum):

  ''' Maps FEC contribution type codes. '''

  # @TODO(sgammon): fill out contribution types


@describe(type=Transaction)
class GenericContributionTotal(Contributor > Vertex):

  ''' Describes a series of summarized contributions from one
      ``Contributor`` (child of ``Organization`` or ``Person``)
        to another ``Contributor``(child of ``Organization``) '''

  #type = ContributionType, {'indexed': True, 'required': True}
  type = str, {'indexed': True, 'required': True}
  count = int, {}
  amount = int, {}


@describe(type=Transaction)
class CampaignContributionTotal(Contributor > Campaign):

  ''' Describes a monetary contribution made from a ``Contributor`` to a
      candidate's ``Campaign``. '''

  ## -- contribution data -- ##
  type = ContributionType, {'indexed': True, 'required': True}
  count = int, {}


@describe(type=Transaction)
class CampaignContribution(Contributor > Campaign):

  ''' Describes a monetary contribution made from a ``Contributor`` to a
      candidate's ``Campaign``. '''

  ## -- contribution data -- ##
  type = ContributionType, {'indexed': True, 'required': True}
  cycle = int, {'indexed': True, 'choices': xrange(1900, 2014)}
  namespace = str, {'indexed': True, 'choices': {
      'urn:fec:transaction', 'urn:nimsp:transaction'}}

  transaction_type = str, {'indexed': True}

  ## -- original data -- ##
  filing = URI, {'indexed': False, 'embedded': True}
  document = URI, {'indexed': False, 'embedded': True}

  ## -- time -- ##
  filed = date, {'indexed': True}
  revised = date, {'indexed': True}


@describe(type=Stat, descriptor=True, keyname=True)
class ContributorStat(CategoricalStatValue):

  ''' Describes campaign finance_categories-related statistics for a
      ``Contributor`` record. Attached as a descriptor object. '''

  # keyname: transaction type


@describe(type=Stat, descriptor=True, keyname=True)
class RecipientStats(CategoricalStatValue):

  ''' Describes campaign finance_categories-related statistics for a ``Campaign``
      record. Attached as a descriptor object. '''

  # keyname: transaction type


@describe(descriptor=True, type=Stat)
class ContributionStat(RankedStatValue):

  '''  '''

  count = float, {'indexed': True, 'repeated': True}
  amount = float, {'indexed': True, 'repeated': True}
