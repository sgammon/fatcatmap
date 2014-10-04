# -*- coding: utf-8 -*-

'''

  fcm: commercial industry models

'''

# graph models
from .. import (Key,
                Vertex,
                describe)

# abstract models
from ..abstract import Name


@describe(type=Name)
class IndustryName(Name):

  ''' Describes a ``Name`` as used when describing an ``Industry``,
      which is defined as a particular form or branch of economic
      or commercial activity. '''

  fec_code = str, {'indexed': True}


@describe(root=True, keyname=True)
class Industry(Vertex):

  ''' Describes an activity or domain in which a great deal of time
      or effort is expended, or a particular form or branch of
      economic activity. '''

  ## -- corporate details -- ##
  name = IndustryName, {'indexed': True, 'required': True, 'embedded': True}
  super = Key, {'indexed': True, 'repeated': True}  # super-industries
  related = Key, {'indexed': True, 'repeated': True}

  @classmethod
  def fixture(cls):

    ''' Prepare default instances of ``Industry`` that should always
        exist. '''

    # top-level industries
    law = cls.new('law')
    law.name.primary, law.name.secondary = (
      'Law', ('Law', 'Lobbying', 'Legal Advocacy'))
    yield law

    labor = cls.new('labor')
    labor.name.primary, labor.name.secondary = (
      'Labor', ('Unions',))
    yield labor

    health = cls.new('health')
    health.name.primary, health.name.secondary = (
      'Health', ('Healthcare',))
    yield health

    energy = cls.new('energy')
    energy.name.primary, energy.name.secondary = (
      'Energy', ('Natural Resources',))
    yield energy

    defense = cls.new('defense')
    defense.name.primary, defense.name.secondary = (
      'Defense', tuple())
    yield defense

    transportation = cls.new('transportation')
    transportation.name.primary, transportation.name.secondary = (
      'Transportation', tuple())
    yield transportation

    entertainment = cls.new('entertainment')
    entertainment.name.primary, entertainment.name.secondary = (
      'Entertainment', tuple())
    yield entertainment

    education = cls.new('education')
    education.name.primary, education.name.secondary = (
      'Education', tuple())
    yield education

    agriculture = cls.new('agriculture')
    agriculture.name.primary, agriculture.name.secondary = (
      'Agriculture', ('Agribusiness',))
    yield agriculture

    finance = cls.new('finance')
    finance.name.primary, finance.name.secondary = (
      'Finance', ('Financial Services',))
    yield finance

    insurance = cls.new('insurance')
    insurance.name.primary, insurance.name.secondary = (
      'Insurance', ('Insurance Services',))
    yield insurance

    realestate = cls.new('realestate')
    realestate.name.primary, realestate.name.secondary = (
      'Real Estate', tuple())
    yield realestate

    construction = cls.new('construction')
    construction.name.primary, construction.name.secondary = (
      'Construction', tuple())
    yield construction

    technology = cls.new('technology')
    technology.name.primary, technology.name.secondary = (
      'Technology', tuple())
    yield technology

    communications = cls.new('communications')
    communications.name.primary, communications.name.secondary = (
      'Communications', ('Telecommunications',))
    yield communications

    # set relations and store
    realestate.related = (finance.key,)
    finance.related = (insurance.key, realestate.key)
    insurance.related = (finance.key,)
    construction.related = (realestate.key,)

    yield finance
    yield insurance
    yield realestate
    yield construction

    securities = cls.new('securities-and-investment')
    securities.super = (finance.key,)
    securities.name.primary, securities.name.secondary = (
      'Securities', ('Securities and Investment',))
    yield securities

    tobacco = cls.new('tobacco')
    tobacco.super = (agriculture.key,)
    tobacco.name.primary, tobacco.name.secondary = (
      'Tobacco', tuple())
    yield tobacco

    dairy = cls.new('dairy')
    dairy.super = (agriculture.key,)
    dairy.name.primary, dairy.name.secondary = (
      'Dairy', tuple())
    yield dairy

    poultry = cls.new('poultry')
    poultry.super = (agriculture.key,)
    poultry.name.primary, poultry.name.secondary = (
      'Poultry', tuple())
    yield poultry

    livestock = cls.new('livestock')
    livestock.super = (agriculture.key,)
    livestock.name.primary, livestock.name.secondary = (
      'Livestock', tuple())
    yield livestock

    yield (securities, tobacco, dairy, poultry, livestock)

