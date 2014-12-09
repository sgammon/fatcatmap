# -*- coding: utf-8 -*-

'''

  fcm: CSV binding reader

'''

from __future__ import absolute_import

# stdlib
import gzip
import yaml

# binding readers
from .base import FileReader, reader


@reader('yaml', 'yaml.gz')
class YAML(FileReader):

  ''' Manages reading of YAML-formatted files. '''

  def open(self):

    ''' Open the target file and prepare it for use. '''

    if self.config.subject.split('.')[-1] == "gz":
      self.file = gzip.open(self.config.subject)
    else:
      self.file = open(self.config.subject)
      self.yaml = yaml.load(self.file)

  def read(self):

    ''' Read the target source file and process it. '''

    if type(self.yaml) in (list,tuple):
      print "running yaml list"
      for obj in self.yaml:
        yield obj

    elif type(self.yaml) in (dict,):
      print "running yaml dict"
      # assumes the YAML file is a dictionary of lists
      for key,value in self.yaml.iteritems():
        for obj in value:
          yield dict([('key',key)] + obj.items())




  def close(self):

    ''' Close the target source file once we're done. '''

    self.file.close()
    self.yaml, self.file = None, None




