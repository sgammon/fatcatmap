# -*- coding: utf-8 -*-

'''

  fcm: data logic

'''

# logic/bind
from canteen import bind, Logic


## Globals
FETCH_COLLECTIONS, FETCH_CACHED = False, True


@bind('data')
class Data(Logic):

  ''' Provides logic for easily accessing/understanding
      data structures native to catnip. '''

  def fetch(self, keys, held=None,
                        cached=FETCH_CACHED,
                        collections=FETCH_COLLECTIONS):

    ''' Retrieve a set of ``keys``, minus any currently ``held``
        ones (assuming they are up-to-date) and ``ignore``d ones,
        while respecting ``cached`` and ``collections`` settings.

        :param keys: Iterable of :py:class:`model.Key` instances or
          ``basestring`` encoded keys to retrieve from underlying
          storage.

        :param held: Iterable of ``KeyTimestampPair`` message/model
          objects that contain a ``(key, timestamp)`` tuple to be
          validated against any fresh data for a 304-style response.

        :param cached: ``bool`` flag, indicating whether the caller
          is willing to tolerate records with an ambiguous or weakly
          guaranteed freshness. Defaults to ``True``.

        :param collections: ``bool`` flag, indicating whether the
          caller wishes to propagate reads to roots and return those
          results with the response as well. Defaults to ``False``,
          as it increases the response size considerably.

        :returns: Yields ``(key, entity)`` pairs, one-at-a-time, and
          corresponding to the order of ``keys`` original given, as
          the underlying storage engine makes them available. '''

    pass
