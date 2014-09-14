# -*- coding: utf-8 -*-

'''

  fcm: state models

'''

# graph models
from . import (Key,
               Model,
               describe)

# abstract models
from .geo import Geobounds
from .abstract import Jurisdiction
from .abstract import JurisdictionName


@describe(root=True, keyname=True, type=Jurisdiction)
class Nation(Vertex):

  ''' Describes a sovereign nation. '''

  name = JurisdictionName, {'indexed': True, 'embedded': True}
  boundary = Geobounds, {'indexed': True}

  @classmethod
  def fixture(cls):

    ''' Provide default ``Nation`` entities. '''

    yield cls.new(key=Key(cls, 'united-states'),
                  name=JurisdictionName(
                    primary='United States of America',
                    secondary='United States'))


@describe(parent=Nation, keyname=True, type=Jurisdiction)
class State(Vertex):

  ''' Describes a state part of a larger nation. '''

  name = JurisdictionName, {'indexed': True, 'embedded': True}
  boundary = Geobounds, {'indexed': True}

  @classmethod
  def fixture(cls, nation):

    ''' Provide default ``State`` entities. '''

    if nation.key.name == 'united-states':

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

      yield cls.new(key=Key(cls, abbr, parent=nation.key), name=JurisdictionName(
        primary=name, secondary='State of %s' % name,
        long_name='Great State of %s' % name, short_name='California',
        abbreviation=abbr))
