# -*- coding: utf-8 -*-

'''

  fcm: concrete place models

'''

# stdlib
from datetime import date

# graph models
from . import (Key,
               Vertex,
               describe)

# geo models
from .geo import (Geopoint,
                  Geobounds)

# abstract models
from .abstract import (PlaceName,
                       Government,
                       Jurisdiction,
                       JurisdictionName)


## Globals
usa = Key('Nation', 'united-states')


@describe(root=True, keyname=True, type=Government)
class Nation(Vertex):

  ''' Describes a sovereign nation, which is a ``Place`` over which
      a ``Government`` has ``Jurisdiction``. '''

  name = JurisdictionName, {'indexed': True, 'embedded': True}
  center = Geopoint, {'indexed': True, 'embedded': True}
  boundary = Geobounds, {'indexed': True, 'embedded': True}
  founded = date, {'indexed': True}

  @classmethod
  def fixture(cls):

    ''' Provide default ``Nation`` entities. '''

    # @TODO(sgammon): geobounds for USA

    yield cls(key=usa,
              name=JurisdictionName(
                primary='United States of America',
                secondary='United States',
                long_name='United States of America',
                short_name='United States',
                abbreviation='USA'),
              founded=date(year=1776, month=7, day=4),
              center=Geopoint(latitude=39.828127,
                              longitude=-98.579404))


@describe(parent=Nation, keyname=True, type=Government)
class State(Vertex):

  ''' Describes a region of a larger ``Nation`` that is governed
      by its own statute-empowered body and given jurisdiction of
      that region by a set of laws in the encompassing ``Nation``. '''

  name = JurisdictionName, {'indexed': True, 'embedded': True}
  center = Geopoint, {'indexed': True, 'embedded': True}
  boundary = Geobounds, {'indexed': True}
  nation = Nation, {'indexed': True}
  founded = date, {'indexed': True}

  @classmethod
  def fixture(cls):

    ''' Provide base ``State`` entities. '''

    # @TODO(sgammon): convert states to datafile with lat/long centers, boundaries and founded dates

    for abbr, name in (('AL', 'Alabama'), ('AK', 'Alaska'), ('AZ', 'Arizona'),
         ('AR', 'Arkansas'), ('CA', 'California'), ('CO', 'Colorado'),
         ('CT', 'Connecticut'), ('DE', 'Delaware'), ('FL', 'Florida'),
         ('GA', 'Georgia'), ('HI', 'Hawaii'), ('ID', 'Idaho'),
         ('IL', 'Illinois'), ('IN', 'Indiana'), ('IA', 'Iowa'),
         ('KS', 'Kansas'), ('KY', 'Kentucky'), ('LA', 'Louisiana'),
         ('ME', 'Maine'), ('MD', 'Maryland'), ('MA', 'Massachusetts'),
         ('MI', 'Michigan'), ('MN', 'Minnesota'), ('MS', 'Mississippi'),
         ('MO', 'Missouri'), ('MT', 'Montana'), ('NE', 'Nebraska'),
         ('NV', 'Nevada'), ('NH', 'New Hampshire'), ('NJ', 'New Jersey'),
         ('NM', 'New Mexico'), ('NY', 'New York'), ('NC', 'North Carolina'),
         ('ND', 'North Dakota'), ('OH', 'Ohio'), ('OK', 'Oklahoma'),
         ('OR', 'Oregon'), ('PA', 'Pennsylvania'), ('RI', 'Rhode Island'),
         ('SC', 'South Carolina'), ('SD', 'South Dakota'), ('TN', 'Tennessee'),
         ('TX', 'Texas'), ('UT', 'Utah'), ('VT', 'Vermont'), ('VA', 'Virginia'),
         ('WA', 'Washington'), ('WV', 'West Virginia'), ('WI', 'Wisconsin'),
         ('WY', 'Wyoming')):

      yield cls(key=Key(cls, abbr, parent=usa), name=JurisdictionName(
        primary=name, secondary='State of %s' % name,
        long_name='Great State of %s' % name, short_name=name,
        abbreviation=abbr),
      nation=usa)


@describe(parent=State, keyname=True, type=Government)
class County(Vertex):

  ''' Describes an area governed by a body of authority hierarchically
      *between* a ``State`` and a ``City`` authority, for the purpose
      of adjudicating regional matters. '''

  name = PlaceName, {'indexed': True, 'embedded': True}
  center = Geopoint, {'indexed': True, 'embedded': True}
  boundary = Geobounds, {'indexed': True}
  state = State, {'indexed': True}
  founded = date, {'indexed': True}


@describe(parent=State, keyname=True, type=Government)
class City(Vertex):

  ''' Describes an a *municipality* for a town or city, which has its
      own governing body empowered by a ``State`` to make decisions
      about business concerning local issues. '''

  name = PlaceName, {'indexed': True, 'embedded': True}
  center = Geopoint, {'indexed': True, 'embedded': True}
  boundary = Geobounds, {'indexed': True}
  state = State, {'indexed': True}
  county = County, {'indexed': True}
  founded = date, {'indexed': True}
