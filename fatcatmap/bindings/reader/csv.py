# -*- coding: utf-8 -*-

'''

  fcm: CSV binding reader

'''

import gzip
from .base import BindingReader, reader


@reader('csv', 'csv.gz')
class CSV(BindingReader):

  ''' Manages reading of CSV-formatted files. '''

  params = {'buffer': 1000}  # how many lines should we buffer?

  def open(self):

    ''' Open the target file and prepare it for use. '''

    self.filename = self.__config__.get('file')
    filename = self.filename.split('.')
    if filename[-1] == "gz":
      self.file = gzip.open(self.filename)
    else:
      self.file = open(self.filename)

  def buffer_lines(self):

    ''' Used to buffer lines when reading the file. '''

    while True:
      num = self.__config__.get('buffer') or 1000
      lines = self.file.readlines(num)
      if not lines:
        break
      for line in lines:
        yield line

  def get_lines(self):

    lines = self.buffer_lines()
    for line in lines:
      row = tuple(line.split(','))
      yield row

  def read(self):

    ''' Read the target source file and process it. '''

    filename = self.filename.split('.')[0]

    if self.__config__.get('has_header'):
      header = [f for f in self.file.readline().split(',') if f] # get the header of the file
    else:
      header = self.__config__.get('header')

    lines = self.buffer_lines()
    for line in lines:
      row = line.split(',')
      #yield (filename,{header[idx]:value for idx,value in enumerate(row)})
      yield {header[idx]:value for idx,value in enumerate(row)}

  def close(self):

    ''' Close the target source file once we're done. '''

    self.file.close()
