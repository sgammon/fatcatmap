# -*- coding: utf-8 -*-

'''

fatcatmap legislative models: committee


    :author: Alexander Rosner <alex@momentum.io>
    :copyright: (c) momentum labs, 2013
'''


# canteen models
from canteen import model
from fatcatmap.models import AppModel


# Member - represents membership in a group type (committee/session/etc).
class Member(AppModel):
	
	committee = basestring, {'indexed': True, 'required': True}
	legislator = basestring, {'indexed': True, 'required': True}
	committee_type = basestring, {'indexed': True}
	govtrackid = basestring, {'indexed' : True}
	name = basestring, {'indexed': True}
	subname = basestring, {'indexed': True}
	role = basestring, {'indexed': True}
	housecode = basestring, {'indexed': True}
	senatecode = basestring, {'indexed': True}
