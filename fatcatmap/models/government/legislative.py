# -*- coding: utf-8 -*-

'''

  fcm: legislative government models

'''

# fcm model base
from .. import (Key,
                date,
                Model,
                Vertex,
                describe)

# abstract models
from ..abstract import (Role,
                        Name,
                        Seat,
                        Group,
                        Event,
                        OrganizationName)

# fcm models
from ..geo import Geobounds
from ..person import Person
from ..social.issues import Issue
from ..content.text import Description
from ..politics.campaign import Campaign
from ..politics.election import Election
from ..politics.party import PoliticalParty

# descriptors
from ..descriptors.ext import URI

# canteen struct
from canteen import model
from canteen.util.struct import BidirectionalEnum


## Globals
us_congress = model.Key('Legislature', 'us-congress')
us_house = model.Key('LegislativeHouse', 'house', parent=us_congress)
us_senate = model.Key('LegislativeHouse', 'senate', parent=us_congress)



## +=+=+=+=+=+=+=+=+ Structure +=+=+=+=+=+=+=+=+ ##


## +=+=+=+=+ Legislatures +=+=+=+=+ ##
@describe(root=True, keyname=True)
class Legislature(Model):

  ''' Describes a legislative body. '''

  name = OrganizationName, {'embedded': True, 'indexed': True}
  jurisdiction = Geobounds, {'repeated': True, 'indexed': True, 'embedded': True}

  @classmethod
  def fixture(cls):

    ''' Generate ``Legislature`` entities. '''

    congress = cls.new(key=us_congress)
    congress.name = OrganizationName(
      primary='US Congress',
      secondary=('United States Congress', 'Congress'),
      formal='United States Congress',
      informal=('Congress',))
    yield congress


@describe(parent=Legislature, keyname=True)
class LegislativeHouse(Model):

  ''' Describes a minor, major, or primary house within a legislative body. '''

  name = OrganizationName, {'embedded': True, 'indexed': True}
  term = int, {'indexed': True, 'range': xrange(2, 10)}
  type = str, {'indexed': True, 'choices': {'major', 'minor', 'primary'}}

  @classmethod
  def fixture(cls):

    ''' Generate ``LegislativeHouse`` entities. '''

    house = LegislativeHouse.new(key=us_house)
    house.name = OrganizationName(
      primary='Congress',
      secondary=('US Congress', 'House of Representatives', 'House of Reps', 'House'),
      formal='United States House of Representatives',
      informal=('House of Representatives', 'House of Reps'))
    house.term = 2
    house.type = 'minor'
    yield house

    senate = LegislativeHouse.new(key=us_senate)
    senate.name = OrganizationName(
      primary='Senate',
      secondary=('US Senate', 'United States Senate'),
      formal='United States Senate',
      informal=('Senate', 'US Senate'))
    senate.term = 6
    senate.type = 'major'
    yield senate


@describe(parent=Legislature, keyname=True)
class LegislativeSession(Model):

  ''' Describes a session of time where a ``Legislature`` is considered to be
      *in session*. '''

  number = int, {'indexed': True, 'required': True}
  start = date, {'indexed': True}
  end = date, {'indexed': True}

  @classmethod
  def fixture(cls):

    ''' Generate ``LegislativeSession`` entities. '''

    sessions = []
    for session_i in xrange(1, 114):
      yield LegislativeSession.new(
        key=Key(LegislativeSession, str(session_i), parent=us_congress),
        number=session_i)


@describe(parent=LegislativeHouse, type=Seat)
class LegislativeOffice(Model):

  ''' Describes a seat to be filled by an official selected through a political
      election.'''

  class SeatType(BidirectionalEnum):

    ''' Describes the types of elected seats generally found in legislatures -
        *bounds*-based districts (like whole US states, in the case of US
        senators), and *population*-based districts (in the case of US
        representatives). '''

    BOUNDS = 0x0  # boundary-based jurisdictions
    POPULATION = 0x1  # population-based jurisdictions

  boundary = Geobounds, {'indexed': True, 'repeated': True}
  type = SeatType, {'indexed': True, 'required': True}



## +=+=+=+=+=+=+=+=+ Vertexes +=+=+=+=+=+=+=+=+ ##


## +=+=+=+=+ Legislators +=+=+=+=+ ##
@describe(parent=Person, type=Role, keyname=True)
class Legislator(Vertex):

  ''' Describes an individual legislative actor, who is an elected (or, in some
      special cases, appointed) member of a ``LegislativeBody``, occupying one
      of many ``LegislativeOffice``s. '''

  seat = LegislativeOffice, {'indexed': False, 'embedded': False}
  election = Election, {'indexed': False, 'embedded': False}
  campaign = Campaign, {'indexed': False, 'embedded': False}


@describe(parent=Legislator, type=Role)
class PartyLeadership(Vertex):

  ''' ``Legislator``-specific role that describes a party leadership role held
      in a ``LegislativeHouse``, such as the *Majority Leader* or *Minority
      Whip*. '''

  type = str, {'indexed': True, 'choices': {'whip', 'leader'}}
  rank = str, {'indexed': True, 'choices': {'majority', 'minority'}}
  party = PoliticalParty, {'indexed': True}


## +=+=+=+=+ Committees +=+=+=+=+ ##
@describe(type=OrganizationName)
class CommitteeName(OrganizationName):

  ''' Describes the naming structure for a legislative committee, including
      indexed separation of the super- and sub-codes, if any. '''

  code = str, {'indexed': True}  # `SSAS16` - 'senate select armed services #16'
  subcode = str, {'indexed': True}  # `16` - committee #16
  supercode = str, {'indexed': True}  # `SSAS` - senate select...


@describe(parent=(LegislativeHouse, Legislature), type=Group, keyname=True)
class Committee(Vertex):

  ''' Describes a committee within one (or sometimes bridging two) house(s)
      of a ``Legislature``. Committees can be an exclusive member of either the
      *major* or *minor* house, or can be a member of both, making it a *joint*
      ``Committee``. '''

  class CommitteeType(BidirectionalEnum):

    ''' Describes the available types of legislative ``Committee``s. '''

    MINOR = 0x0  # for committees that are exclusively part of a minor house
    MAJOR = 0x1  # for committees that are exclusively part of a major house
    JOINT = 0x2  # for committees that are unexclusively part of both houses

  ## -- structure -- ##
  super = Key, {'indexed': True}
  type = CommitteeType, {'indexed': True, 'required': True}

  ## -- naming and resources -- ##
  name = CommitteeName, {'embedded': True, 'indexed': True}
  website = URI, {'embedded': True, 'indexed': True}


## +=+=+=+=+ Legislation +=+=+=+=+ ##
@describe(parent=LegislativeSession, keyname=True)
class Legislation(Vertex):

  ''' Describes a legislative proposal, made by a ``Legislator`` in a
      ``LegislativeHouse``. '''

  # keyname: bill ID

  @describe
  class BillName(Name):

    ''' Describes the concept of a ``Bill``'s name, which carries a long title,
        short title, and bill code name. '''

    code = str, {'indexed': True, 'required': True}
    longtitle = str, {'indexed': True, 'repeated': True}
    shorttitle = str, {'indexed': True, 'repeated': True}

  class BillOrigin(BidirectionalEnum):

    ''' Describes the available origins of a ``Bill``, which is always a single
        house of a ``Legislature``, or the *primary* house if there is only
        one. '''

    MINOR = 0x0  # for bills that originate in a minor house
    MAJOR = 0x1  # for bills that originate in a major house
    PRIMARY = 0x2  # for bills in legislatures with only one house

  class BillType(BidirectionalEnum):

    ''' Describes the types of ``Bill`` objects that can be proposed by a
        ``Legislator``.

        - A *Bill* is a regular proposal to change law relating to issues
          domestic or foreign. Most legislation is

        - *Joint* legislation requires the approval of **both**
          ``LegislativeHouse``s in a ``Legislature``.

        - *Simple* (resolutions) are strictly procedural in nature and usually
            only relate internally to the ``LegislativeHouse`` they originate
            from.

        - *Concurrent* (resolutions) are proposals to a legislative body that
          act like regular bills,  '''

    BILL = 0x0  # for regular proposals for foreign and domestic issues
    JOINT = 0x1  # for proposals that span both chambers, not really different
    SIMPLE = 0x2  # simple (procedural/always one-house) resolutions
    CONCURRENT = 0x3  # legislative proposals with no force of law

  ## -- filing details -- ##
  code = str, {'indexed': True, 'required': True}
  type = BillType, {'indexed': True, 'required': True}
  origin = BillOrigin, {'indexed': True, 'required': True}

  ## -- structural details -- ##
  name = BillName, {'indexed': True, 'embedded': True, 'repeated': True}
  issues = Issue, {'indexed': True, 'repeated': True}


@describe(parent=LegislativeSession, keyname=True, type=Event)
class Rollcall(Vertex):

  ''' Represents an event where a ``Legislature`` calls roll to vote on a
      particular matter. Referenced from ``Vote``, which are individual
      vote edges submitted by legislative members (``Legislator``s). '''

  # keyname: special rollcall ID

  passed = bool, {'indexed': True, 'default': False}
  result = Description, {'embedded': True}
  description = Description, {'embedded': True}


## +=+=+=+=+=+=+=+=+ Edges +=+=+=+=+=+=+=+=+ ##


## +=+=+=+=+ Legislators +=+=+=+=+ ##
@describe
class Vote(Legislator >> Legislation):

  ''' A ``Legislator``'s vote at a particular step in the legislative process
      concerning a piece of ``Legislation``. '''

  rollcall = Rollcall, {'embedded': False, 'indexed': True}
  vote = bool, {'indexed': True, 'default': None}
  procedural = bool, {'indexed': True, 'default': True}
  committee = Committee, {'indexed': True}


@describe
class Coauthorship(Legislator >> Legislation):

  ''' A ``Legislator``'s official declaration of collaboration and support
      concerning a piece of ``Legislation``. '''


@describe
class CommitteeMember(Legislator > Committee):

  ''' Describes a membership held by a ``Legislator`` on a legislative
      ``Committee``, which is a smaller body within a ``Legislature``
      responsible for some aspect of running either Congress or the USA. '''

  class CommitteeLeadership(BidirectionalEnum):

    ''' Describes ``Committee`` leadership structure options, which include the
        ``chair`` of the committee (essentially, the leader), the ``co-chair``
        of the committee (backup/2nd-level leader, usually opposing party). '''

    CHAIR = 0x0  # single and sole leader of the committee
    COCHAIR = 0x1  # leader of the committee, shared with other people
    VICECHAIR = 0x2  # second-in-command leader of the committee
    RANKING = 0x3  # second-in-command for majority or minority party
    EX_OFFICIO = 0x4  # holder of a seat on the committee because of another office

  leadership = CommitteeLeadership, {'indexed': True}
