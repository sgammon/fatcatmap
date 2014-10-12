# -*- coding: utf-8 -*-

'''

  fcm: content messages

'''

# model API
from canteen import model


class ContentRequest(model.Model):

  '''  '''


class GeneratedContent(model.Model):

  '''  '''


class TemplateRequest(model.Model):

  ''' Request for a client-side template. '''

  path = basestring


class ClientTemplate(TemplateRequest):

  ''' Represents a client-side template on the wire. '''

  source = basestring
