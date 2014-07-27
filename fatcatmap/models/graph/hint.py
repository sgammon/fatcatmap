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

  '''  '''

  graph = graph.Graph
  expires = datetime.datetime

  @classmethod
  def spawn(cls, graph):

    '''  '''

    _hash = graph.hash()
    return cls(
      key=model.Key(cls, _hash),
      hash=_hash,
      graph=graph,
      expires=datetime.datetime.now() + HINT_LIFETIME
    )
