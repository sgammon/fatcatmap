# -*- coding: utf-8 -*-

'''

  fcm: client-side view logic

'''

# stdlib
import os

# 3rd party
import slimmer

# fatcatmap
from fatcatmap import config as cfg

# canteen
from canteen import decorators, Logic


## Globals

## template Path
template_path = os.path.join(*(
  cfg.app['paths']['app'], 'assets', 'js', 'templates'))

## preloaded templates list
_templates = [i for i in (
  os.path.join(dp, f) for dp, dn, fn in (
    os.walk(template_path)) for f in fn)]


def _read_template(filename):

  ''' Read the client-side template file located at the OS-appropriate joined
      combination of ``template_path`` and ``filename``.

      Buffer the contents and return, joined as a single string.

      :raises ValueError: If the provided ``filename`` does not point to a valid
        template file under ``template_path``.

      :returns: Contents of the file at ``template_path + filename``, joined
        into a single string. '''

  full_path = (filename if filename.startswith(template_path) else (
        os.path.join(template_path, *(x for x in filename.split('/') if x))))

  if not os.path.isfile(full_path):
    raise ValueError('Not a file: %s' % full_path)

  with open(full_path, 'r') as template:
    lines = []
    for line in template.read():
      lines.append(line)

    return slimmer.html_slimmer(u''.join((unicode(x, 'latin-1') for x in lines)))


def _get_filename(path):

  ''' Extract the filename portion from a full path to a template file.

      :param path: Full path to the template file to extract from.
      :returns: Extracted filename from full template path. '''

  return path.replace(template_path + '/', '')


@decorators.bind('views')
class ClientTemplate(Logic):

  ''' Provides access to client-side view templates, made accessible at short
      string-paths based on their filenames. '''

  known_templates = {
    _get_filename(path): _read_template(path) for path in _templates}

  index = {k.replace('.html', '').replace(template_path + '/', ''): v for k, v in known_templates.iteritems()}

  def load_template(self, filename):

    ''' Scan known templates for the target ``filename`` in question, and
        either provide (if found) or attempt to load manually via
        ``_read_template``.

        :param filename: Filename at which a template should be searched for,
          loaded, and returned.

        :returns: Contents of the template at ``filename``, assuming it exists
          and is readable. If contents were preloaded during construction time,
          content is retrieved directly from the known templates cache. '''

    if filename in self.known_templates:
      return self.known_templates[filename]
    return _read_template(filename)

  def describe(self):

    ''' Simply provide the known templates cache.

        :returns: Map of known ``filename -> template`` mappings, preloaded at
          server construction time. '''

    return self.index
