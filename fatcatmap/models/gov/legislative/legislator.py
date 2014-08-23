# -*- coding: utf-8 -*-

'''

  fcm: legislative actor models

'''

# stdlib
import datetime

# graph models
from fatcatmap.models import Vertex


class Legislator(Vertex):

  ''' Describes an individual person who acts as a legislative and political
      actor, past or present. '''

  # -- primary naming -- #
  firstname = str, {'indexed': True}
  lastname = str, {'indexed': True}
  nickname = str, {'indexed': True}

  # -- alternate natming -- #
  namemod = str, {'indexed': True}
  lastnameenc = str, {'indexed': True}
  lastnamealt = str, {'indexed': True}

  # -- personal details -- #
  birthday = datetime.date, {'indexed': True}  # @TODO(arosner): convert to date property when it works
  gender = str, {'indexed': True, 'choices': frozenset(('m', 'f'))}
  religion = str, {'indexed': True, 'default': None}

  # -- external IDs -- #
  govtrack_id = long, {'indexed': True}
  thomas_id = str, {'indexed': True}
  os_id = str, {'indexed': True, 'default': None}
  bioguide_id = str, {'indexed': True, 'default': None}
  pvs_id = long, {'indexed': True, 'default': None}
  fec_id = str, {'indexed': True, 'default': None}
  metavid_id = str, {'indexed': True, 'default': None}
  youtube_id = str, {'indexed': True, 'default': None}
  twitter_id = str, {'indexed': True, 'default': None}
  lismember_id = str, {'indexed': True, 'default': None}
  icpsr_id = long, {'indexed': True, 'default': None}
  fb_id = long, {'indexed': True, 'default': None}
