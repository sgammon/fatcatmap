# -*- coding: utf-8 -*-

'''

  fcm: govtrack model bindings

'''

# stdlib
import datetime

# bindings
from . import ModelBinding, bind

# models
from fatcatmap.models.person import Person
from fatcatmap.models.descriptors import ext
from fatcatmap.models.campaign import finance
from fatcatmap.models.politics import campaign
from fatcatmap.models.government import legislative


@bind('govtrack', 'Person', Person)
class GovtrackPerson(ModelBinding):

  ''' Converts and resolves instances of GovTrack legislators
      to valid ``Person`` records. '''

  # {u'lastnamealt': None, u'icpsrid': None, u'govtrack_id': 400574, u'lastnameenc': u'Canady', u'firstname': u'Charles', u'twitterid': None, u'lastname': u'Canady', u'lismemberid': None, u'bioguideid': u'C000107', u'namemod': None, u'fbid': None, u'fecid': None, u'religion': None, u'metavidid': None, u'birthday': u'1954-06-22', u'youtubeid': None, u'gender': u'M', u'osid': u'legacy', u'nickname': None, u'thomas_id': u'00171', u'pvsid': None}

  def convert(self, data):

    '''  '''

    person = Person.new()

    # naming & personal details
    person.name.primary = "%s %s" % (data['firstname'], data['lastname'])
    person.name.given, person.name.family = (
      data['firstname'], data.get('lastnameenc', data['lastname']))

    if data.get('nickname'): person.name.nickname = data['nickname']
    if data.get('lastnamealt'): person.name.secondary = '%s %s' % (data['firstname'], data['lastnamealt'])
    if data.get('gender'): person.gender = data['gender'].lower()
    if data.get('birthday'): person.birthdate = data['birthday']

    yield person
