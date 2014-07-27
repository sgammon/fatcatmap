# -*- coding: utf-8 -*-

'''

  fcm: graph hint models

'''

# stdlib
import datetime

# local
from . import graph

# canteen
from canteen import model

# app model
from fatcatmap.models import AppModel


## Constants
HINT_LIFETIME = datetime.timedelta(days=30)


class Hint(AppModel):

  ''' Represents a hint leftover from a previous query, which
      attaches a cached graph fragment to a guessable key.

      This allows future queries to optionally look for hints
      and potentially yield better performance by avoiding
      queries. '''

  hash = basestring, {'required': True}
  graph = graph.Graph, {'required': True}
  expires = datetime.datetime, {'required': True}

  @classmethod
  def spawn(cls, graph):

    '''  '''

    _hash = graph.fingerprint()
    return cls(
      key=model.Key(cls, _hash),
      hash=_hash,
      graph=graph,
      expires=datetime.datetime.now() + HINT_LIFETIME
    )
