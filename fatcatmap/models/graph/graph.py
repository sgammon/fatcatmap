# -*- coding: utf-8 -*-

'''

  fcm: graph hint models

'''

# stdlib
import hashlib

# canteen
from canteen import model

# app model
from fatcatmap.models import AppModel


## Constants
DEFAULT_DEPTH = 1  # only map to 1-traversal out by default
DEFAULT_LIMIT = 15  # limit edge count per traversal step


class GraphOptions(AppModel):

  ''' Model representing options related to a particular
      instance of a ``Graph``. '''

  depth = int, {'default': DEFAULT_DEPTH}
  limit = int, {'default': DEFAULT_LIMIT}

  def describe(self):

    ''' Describe the local instance in a string that can
        later be unpacked into an identical object. '''

    return "/".join(map(str, (self.depth, self.limit)))

  @classmethod
  def from_describe(cls, spec):

    ''' Unpack a string representing a ``GraphOptions``
        structure, generated previously from ``describe``. '''

    depth, limit = tuple(map(int, spec.split("/")))
    return cls(depth=depth, limit=limit)


class Graph(AppModel):

  ''' Model representing a single instance of a structure
      representing ``Nodes``, interlinked by ``Edges``. Can
      optionally contain references to full data for those
      objects. '''

  data = model.Key, {'repeated': True}
  structure = model.Key, {'repeated': True}
  hash = basestring, {'required': False}
  origin = model.Key, {'required': True}
  options = GraphOptions, {'default': GraphOptions()}

  def hash(self):

    ''' Generate a content-based unique hash of this Graph.
        Includes both structural and data keys. '''

    hash, lookup = hashlib.sha1(), set()
    for keygroup in (self.data, self.structure, (self.origin,)):
      for key in keygroup:
        if key not in lookup:
          lookup.add(key)
          hash.update(key)

    return hash.hexdigest()

  def fingerprint(self, hash=False):

    ''' Generate a string fingerprint for this Graph from
        the input parameters: ``origin``, ``depth`` and
        ``limit``.

        Optionally make a hash of the contents, too. '''

    id = hashlib.sha1('::'.join(map(str, (
      self.origin, self.options.describe())))).hexdigest()

    if not hash: return id

    # optionally hash contents, too
    return {
      'id': id,
      'content': self.hash(),
      'options': self.options.describe()
    }
