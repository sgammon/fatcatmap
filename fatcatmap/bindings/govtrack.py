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
from fatcatmap.models.social import religion
from fatcatmap.models.descriptors import ext
from fatcatmap.models.campaign import finance
from fatcatmap.models.politics import campaign
from fatcatmap.models.government import legislative


## Globals
_known_religions = {  # @TODO(sgammon): make this not suck
  'presbyterian': religion.presbyterian,
  'episcopalian': religion.episcopalian,
  'episcopal': religion.episcopalian,
  'mormon': religion.lds,
  'latter day saints': religion.lds,
  'jewish': religion.judaism,
  'catholic': religion.catholic,
  'christian': religion.christianity,
  'baptist': religion.baptist,
  'lutheran': religion.lutheran,
  'unitarian': religion.unitarian,
  'nazarene': religion.disciples,
  'protestant': religion.protestant,
  'methodist': religion.methodist,
  'adventist': religion.adventist,
  'christ': religion.christianity}


@bind('govtrack', 'Person', Person)
class GovtrackPerson(ModelBinding):

  ''' Converts and resolves instances of GovTrack legislators
      to valid ``Person`` records. '''

  # {u'lastnamealt': None, ..., u'lastnameenc': u'Canady', u'firstname': u'Charles', u'lastname': u'Canady', u'namemod': None, u'religion': None, u'gender': u'M', u'nickname': None}

  def convert(self, data):

    '''  '''

    person = Person.new()

    # naming & personal details
    person.name.primary = "%s %s" % (data['firstname'], data['lastname'])
    person.name.given, person.name.family = (
      data['firstname'], data.get('lastnameenc', data['lastname']))
    if data.get('namemod'): person.name.postfix = (data['namemod'],)
    if data.get('nickname'): person.name.nickname = (data['nickname'],)
    if data.get('lastnamealt'): person.name.secondary = ('%s %s' % (data['firstname'], data['lastnamealt']),)
    if data.get('gender'): person.gender = data['gender'].lower()
    if data.get('birthday'): person.birthdate = data['birthday']

    if data.get('religion'):
      # @TODO(sgammon): yielding records with errors for tracking
      religion = data['religion']

      if religion.lower().strip().replace(' ', '') != 'unknown':
        # might have it straight up
        if religion.lower() in _known_religions:
          person.religion = _known_religions[religion.lower()]
        else:
          # otherwise look for it
          for label, key in _known_religions.iteritems():
            if label in religion.lower().strip().replace(' ', ''):
              person.religion = key
              break
          if not person.religion:
            self.logging.warning('!! ------ Unknown religion "%s". ------ !!' % data['religion'])

    yield person
