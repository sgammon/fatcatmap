# -*- coding: utf-8 -*-

'''

  fcm: abstract jurisdiction models

'''

# graph models
from .. import (Key,
                Model,
                describe)

# abstract models
from .name import Name
from .place import (Place,
                    PlaceName)



@describe(type=Name)
class JurisdictionName(PlaceName):

  ''' Describes a name for a ``Jurisdiction``, including official
      abbreviations or names as they exist in statute. '''

  statute = str, {'indexed': True}
  abbreviation = str, {'indexed': True}


@describe(abstract=True, type=Place)
class Jurisdiction(Model):

  ''' Represents an area or object with legal power to administrate
      or make decisions and judgements. Usually accompanies a system
      of law, including courts, which would be judicatures. '''

  higher_authority = Key, {'indexed': True}
  name = JurisdictionName, {'indexed': True, 'embedded': True}
