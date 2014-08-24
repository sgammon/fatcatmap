# -*- coding: utf-8 -*-

'''

    fcm: legislative models

'''

# stdlib
import datetime

# canteen struct
from canteen import struct

# canteen models
from canteen.model import VertexKey

# fcm models
from fatcatmap.models import geo
from fatcatmap.models import Model
from fatcatmap.models import Vertex
from fatcatmap.models import abstract
from fatcatmap.models import describe
from fatcatmap.models import politics
from fatcatmap.models.social import issues
from fatcatmap.models.natural import Person


## +=+=+=+=+=+=+=+=+ Structure +=+=+=+=+=+=+=+=+ ##


## +=+=+=+=+ Legislatures +=+=+=+=+ ##
@describe(root=True)
class Legislature(Model):

  ''' Describes a legislative body. '''

  name = abstract.OrganizationName, {'embedded': True, 'indexed': True}
  jurisdiction = geo.Geobounds, {'repeated': True, 'indexed': True}


@describe(parent=Legislature)
class LegislativeHouse(Model):

  ''' Describes a minor, major, or primary house within a legislative body. '''

  name = abstract.OrganizationName, {'indexed': True}
  term = int, {'indexed': True, 'range': xrange(2, 10)}
  type = str, {'indexed': True, 'choices': {'major', 'minor', 'primary'}}


@describe(parent=LegislativeHouse)
class LegislativeSeat(Model):

  ''' Describes a seat to be filled by an official selected through a political
      election.'''

  class SeatType(struct.BidirectionalEnum):

    ''' Describes the types of elected seats generally found in legislatures -
        *bounds*-based districts (like whole US states, in the case of US
        senators), and *population*-based districts (in the case of US
        representatives). '''

    BOUNDS = 0x0  # boundary-based jurisdictions
    POPULATION = 0x1  # population-based jurisdictions

  boundary = geo.Geobounds, {'indexed': True, 'repeated': True}
  type = int, {'indexed': True, 'choices': [val for (key, val) in SeatType()]}


## +=+=+=+=+=+=+=+=+ Vertexes +=+=+=+=+=+=+=+=+ ##


## +=+=+=+=+ Legislators +=+=+=+=+ ##
@describe(parent=Person, type=abstract.Role)
class Legislator(Vertex):

  ''' Describes an individual legislative actor, who is an elected (or, in some
      special cases, appointed) member of a ``LegislativeBody``, occupying one
      of many ``LegislativeSeat``s. '''

  seat = LegislativeSeat, {'indexed': True, 'required': True}
  election = politics.Election, {'indexed': True}


@describe(parent=Legislator, type=abstract.Role)
class PartyLeadership(Vertex):

  ''' ``Legislator``-specific role that describes a party leadership role held
      in a ``LegislativeHouse``, such as the *Majority Leader* or *Minority
      Whip*. '''

  type = str, {'indexed': True, 'choices': {'whip', 'leader'}}
  rank = str, {'indexed': True, 'choices': {'majority', 'minority'}}
  party = politics.PoliticalParty, {'indexed': True}


## +=+=+=+=+ Committees +=+=+=+=+ ##
@describe(parent=Legislature, type=abstract.Group)
class Committee(Vertex):

  ''' Describes a committee within one (or sometimes bridging two) house(s)
      of a ``Legislature``. Committees can be an exclusive member of either the
      *major* or *minor* house, or can be a member of both, making it a *joint*
      ``Committee``. '''

  class CommitteeType(struct.BidirectionalEnum):

    ''' Describes the available types of legislative ``Committee``s. '''

    MINOR = 0x0  # for committees that are exclusively part of a minor house
    MAJOR = 0x1  # for committees that are exclusively part of a major house
    JOINT = 0x2  # for committees that are unexclusively part of both houses

  ## -- structure -- ##
  super = VertexKey, {'indexed': True}
  type = str, {'indexed': True, 'choices': (
                        [val for (key, val) in CommitteeType()])}

  ## -- naming and resources -- ##
  name = abstract.OrganizationName, {'embedded': True, 'indexed': True}
  website = abstract.URI, {'indexed': True}


## +=+=+=+=+ Legislation +=+=+=+=+ ##
@describe(root=True)
class Legislation(Vertex):

  ''' Describes a legislative proposal, made by a ``Legislator`` in a
      ``LegislativeHouse``. '''

  class BillName(abstract.Name):

    ''' Describes the concept of a ``Bill``'s name, which carries a long title,
        short title, and bill code name. '''

    code = str, {'indexed': True, 'required': True}
    longtitle = str, {'indexed': True, 'required': True}
    shorttitle = str, {'indexed': True, 'required': True}

  class BillOrigin(struct.BidirectionalEnum):

    ''' Describes the available origins of a ``Bill``, which is always a single
        house of a ``Legislature``, or the *primary* house if there is only
        one. '''

    MINOR = 0x0  # for bills that originate in a minor house
    MAJOR = 0x1  # for bills that originate in a major house
    PRIMARY = 0x2  # for bills in legislatures with only one house

  class BillType(struct.BidirectionalEnum):

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
  type = int, {'indexed': True, 'choices': [val for (key, val) in BillType()]}
  origin = int, {'indexed': True, 'choices': [
                                    val for (key, val) in BillOrigin()]}

  ## -- structural details -- ##
  name = BillName, {'indexed': True}
  issues = issues.Issue, {'indexed': True, 'repeated': True}
  cycle = int, {'indexed': True, 'required': True, 'choices': xrange(1, 113)}



## +=+=+=+=+=+=+=+=+ Edges +=+=+=+=+=+=+=+=+ ##


## +=+=+=+=+ Legislators +=+=+=+=+ ##
class Vote(Legislator >> Legislation):

  ''' A ``Legislator``'s vote at a particular step in the legislative process
      concerning a piece of ``Legislation``. '''

  call = bool, {'indexed': True, 'default': None, 'required': True}
  procedural = bool, {'indexed': True, 'default': True}
  committee = Committee, {'indexed': True}


class Coauthorship(Legislator >> Legislation):

  ''' A ``Legislator``'s official declaration of collaboration and support
      concerning a piece of ``Legislation``. '''


class CommitteeMember(Legislator > Committee):

  ''' Describes a membership held by a ``Legislator`` on a legislative
      ``Committee``, which is a smaller body within a ``Legislature``
      responsible for some aspect of running either Congress or the USA. '''

  class CommitteeLeadership(struct.BidirectionalEnum):

    ''' Describes ``Committee`` leadership structure options, which include the
        ``chair`` of the committee (essentially, the leader), the ``co-chair``
        of the committee (backup/2nd-level leader, usually opposing party). '''

    COCHAIR = 0x1
    CHAIR = 0x2

  leadership = int, {'indexed': True, 'default': None, 'choices': [
    val for (key, val) in CommitteeLeadership()]}
