# -*- coding: utf-8 -*-

'''

  fcm: CSV binding reader

'''

from __future__ import absolute_import

# stdlib
import gzip
import json
import csv

# binding readers
from .base import FileReader, reader



@reader('csv', 'csv.gz')
class CSV(FileReader):

  ''' Manages reading of CSV-formatted files. '''

  params = {
    'json': False,  # decode CSV values as JSON
    'files': set,  # all files in the current load
    'buffer': 1000,
    'fields': None}  # how many lines should we buffer?

  def open(self):

    ''' Open the target file and prepare it for use. '''

    if self.config.subject.split('.')[-1] == "gz":
      self.file = gzip.open(self.config.subject)
    else:
      self.file = open(self.config.subject)

    if not self.config.fields:
      # get the header of the file
      first_line = csv.reader([self.file.readline()]).next()
      self.fields = [f.strip().replace('\n', '') for f in first_line if f]
    else:
      self.fields = self.config.fields

  def buffer_lines(self):

    ''' Used to buffer lines when reading the file. '''

    while True:
      lines = self.file.readlines(self.config.buffer)
      if not lines: break
      for line in lines: yield line

  def get_lines(self):

    ''' Fetch a batch of lines. '''

    for line in self.buffer_lines():
      yield tuple(line.split(','))

  def read(self):

    ''' Read the target source file and process it. '''

    def inflate(val):

      ''' Inflate a value, maybe with JSON. '''

      if self.config.json:
        try:
          return json.loads(val)
        except ValueError:
          pass
      return val

    #for line in self.buffer_lines():
    #  yield {self.fields[idx]: inflate(value) for idx, value in enumerate(line.split(','))}
    for line in self.buffer_lines():
      row = csv.reader([line]).next()
      yield {self.fields[idx]: inflate(value) for idx, value in enumerate(row)}

  def close(self):

    ''' Close the target source file once we're done. '''

    self.file.close()
    self.fields, self.file = None, None
