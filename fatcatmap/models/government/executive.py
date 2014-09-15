# -*- coding: utf-8 -*-

'''

  fcm: executive government models

'''

# fcm models
from .. import (Key,
                Vertex,
                describe,
                VertexKey)

# USA stuff
from ..place import usa

# person model
from ..person import Person

# abstract models
from ..abstract import (Role,
                        Seat,
                        Group,
                        Government,
                        Organization,
                        OrganizationName)

# descriptors
from ..descriptors.ext import URI


@describe(parent=Government, type=Organization)
class ExecutiveAgency(Vertex):

  ''' Describes an organization that is part of executive government and
      logically groups people and resources for a specific task or
      responsibility, such as the Department of Energy or the CIA. '''

  name = OrganizationName, {'embedded': True, 'indexed': True, 'required': True}
  website = URI, {'embedded': True, 'indexed': True}

  @classmethod
  def fixture(cls):

    ''' Construct base ``ExecutiveAgency`` entities. '''

    for short, uri in (('Agriculture', 'http://usda.gov'),
                       ('Commerce', 'http://commerce.gov'),
                       ('Defense', 'http://defense.gov'),
                       ('Education', 'http://ed.gov'),
                       ('Energy', 'http://energy.gov'),
                       ('Health and Human Services', 'http://hhs.gov'),
                       ('Homeland Security', 'http://dhs.gov'),
                       ('Urban Development', 'http://hud.gov'),
                       ('Interior', 'http://interior.gov'),
                       ('Justice', 'http://justice.gov'),
                       ('Labor', 'http://dol.gov'),
                       ('State', 'http://state.gov'),
                       ('Transportation', 'http://dot.gov'),
                       ('Treasury', 'http://treasury.gov'),
                       ('Veterans Affairs', 'http://www.va.gov')):

      yield cls(key=Key(cls, short.lower().replace(' ', '-')),
                name=OrganizationName(
                  primary='Department of %s' % short,
                  secondary='US Department of %s' % short,
                  formal='United States Department of %s' % short,
                  informal='Department of %s' % short),
                website=URI(location=uri))


@describe(parent=Government, type=Seat)
class ExecutiveOffice(Vertex):

  ''' Describes an appointed or elected executive office in Government, that can
      be occupied by an ``ExecutiveOfficer``. Potentially part of an
      ``ExecutiveAgency`` but could also be above any particular organization,
      like a US President. '''

  type = str, {'indexed': True, 'choices': {'elected', 'appointed'}}
  term = int, {'indexed': True, 'choices': xrange(1, 25), 'default': None}
  max_terms = int, {'indexed': True, 'choices': xrange(2, 10), 'default': None}
  agency = ExecutiveAgency, {'indexed': True, 'embedded': True}

  @classmethod
  def fixtures(cls):

    ''' Construct base ``ExecutiveOffice`` entities. '''

    yield cls(key=Key(cls, 'president', parent=usa), type='elected', term=4, max_terms=2)
    yield cls(key=Key(cls, 'vice-president', parent=usa), type='appointed', term=4)


@describe(parent=Person, type=Role)
class ExecutiveOfficial(Vertex):

  ''' Describes a government official that occupies an ``ExecutiveOffice`` for
      an amount of time, either via appointment or election to that office. '''

  reports_to = VertexKey, {'indexed': True}
  seat = ExecutiveOffice, {'embedded': True, 'indexed': True}
