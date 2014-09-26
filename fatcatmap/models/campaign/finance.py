# -*- coding: utf-8 -*-

'''

  fcm: campaign finance models

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

# descriptors
from ..descriptors.ext import URI
from ..descriptors.stat import CategoricalStatValue

# canteen structs
from canteen.util.struct import BidirectionalEnum


@describe(parent=(Person, Organization), type=Role)
class Contributor(Vertex):

  ''' Represents a financial support role that a ``Person`` or
      ``Corporation`` can assume in a campaign politics context. '''

  ## -- naming / categorization -- ##
  fec_category = str, {'indexed': True}


@describe(type=Transaction)
class CampaignContribution(Contributor >> Campaign):

  ''' Describes a monetary contribution made from a ``Contributor`` to a
      candidate's ``Campaign``. '''

  class ContributionType(BidirectionalEnum):

    ''' Maps FEC contribution type codes. '''

    # @TODO(sgammon): fill out contribution types

  ## -- contribution data -- ##
  type = ContributionType, {'indexed': True, 'required': True}
  cycle = int, {'indexed': True, 'choices': xrange(1900, 2014)}
  namespace = str, {'indexed': True, 'choices': {
      'urn:fec:transaction', 'urn:nimsp:transaction'}}

  transaction_type = str, {'indexed': True}

  ## -- original data -- ##
  filing = URI, {'indexed': True, 'embedded': True}
  document = URI, {'indexed': True, 'embedded': True}

  ## -- time -- ##
  filed = date, {'indexed': True}
  revised = date, {'indexed': True}


@describe(type=Stat, descriptor=True, keyname=True)
class ContributorStats(CategoricalStatValue):

  ''' Describes campaign finance-related statistics for a
      ``Contributor`` record. Attached as a descriptor object. '''

  # keyname: transaction type


@describe(type=Stat, descriptor=True, keyname=True)
class RecipientStats(CategoricalStatValue):

  ''' Describes campaign finance-related statistics for a ``Campaign``
      record. Attached as a descriptor object. '''

  # keyname: transaction type