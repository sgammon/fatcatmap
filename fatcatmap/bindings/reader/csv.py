# -*- coding: utf-8 -*-

'''

  fcm: CSV binding reader

'''

# stdlib
import gzip
import json

# binding readers
from .base import FileReader, reader



@reader('csv', 'csv.gz')
class CSV(FileReader):

  ''' Manages reading of CSV-formatted files. '''

  params = {
    'json': False,  # decode CSV values as JSON
    'files': set,  # all files in the current load
    'buffer': 1000}  # how many lines should we buffer?

  def open(self):

    ''' Open the target file and prepare it for use. '''

    if self.config.subject.split('.')[-1] == "gz":
      self.file = gzip.open(self.config.subject)
    else:
      self.file = open(self.config.subject)

    # get the header of the file
    self.fields = [f.strip().replace('\n', '') for f in self.file.readline().split(',') if f]

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

    inflate = lambda x: json.loads(x) if self.config.json else x

    for line in self.buffer_lines():
      yield {self.fields[idx]: inflate(value) for idx, value in enumerate(line.split(','))}

  def close(self):

    ''' Close the target source file once we're done. '''

    self.file.close()
    self.fields, self.file = None, None
