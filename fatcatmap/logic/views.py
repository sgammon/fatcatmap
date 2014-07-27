# -*- coding: utf-8 -*-

'''

  fcm: views logic

'''

# stdlib
import os

# fatcatmap
from fatcatmap import config

# canteen
from canteen import decorators, Logic


## Template Path
template_path = os.path.join(config.app['paths']['app'], 'assets', 'js', 'templates')
_templates = [os.path.join(dp, f) for dp, dn, fn in os.walk(template_path) for f in fn]


def _read_template(filename):

  '''  '''

  full_path = (
    filename if filename.startswith(template_path) else (
      os.path.join(template_path, *(x for x in filename.split('/') if x))))

  if not os.path.isfile(full_path):
    raise ValueError('Not a file: %s' % full_path)

  with open(full_path, 'r') as template:
    return ''.join(template.read())


@decorators.bind('views')
class ClientTemplate(Logic):

  ''' does stuffs '''

  known_templates = {
    path.replace(template_path + '/', ''): _read_template(path) for path in _templates
  }

  @staticmethod
  def _get_filename(self, path):

    '''  '''

    return path.replace(template_path, '')

  def load_template(self, filename):

    '''  '''

    if filename in self.known_templates:
      return self.known_templates[filename]
    return _read_template(filename)

  def describe(self):

    '''  '''

    return self.known_templates
