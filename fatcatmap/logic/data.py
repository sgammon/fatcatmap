# -*- coding: utf-8 -*-

'''

  fcm: data logic

'''

# stdlib
import hashlib, datetime

# logic/bind
from canteen import model, bind, Logic


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

    from fatcatmap import models

    keyset = [(model.Key.from_urlsafe(k) if isinstance(k, basestring) else k) for k in keys]

    # yield upwards
    for key, entity in zip(keyset, models.BaseModel.get_multi(keyset)):
      yield key, entity or None

  def serialize(self, target, results, **properties):

    ''' Serialize a data API ``FetchResponse`` into a structure
        suitable for return to the client.

        :param target: Implementation :py:class:`Model` to inflate
          and serialize.

        :param results: Array of results to encode, where each item
          is a :py:class:`Model` instance to pack.

        :returns: Instance of :py:class:`FetchResponse` suitable
          for handing directly to the calling client. '''

    from fatcatmap.services.data import messages as data

    keys, objects, fragment, freshness = (
      [], [], hashlib.sha1(), datetime.datetime.now())

    # build hash and object structures as we go
    for r in results:
      if r is not None:
        encoded, result = r.key.urlsafe(), r
        fragment.update(encoded)

        # append to data, in tandem
        objects.append(data.DataObject(data=result.to_dict()))
        keys.append(data.KeyTimestampPair(encoded=encoded, timestamp=freshness))
      else:
        keys.append(data.KeyTimestampPair(encoded=''))
        objects.append(data.DataObject())

    # construct and return
    return target(count=len(results),
                  objects=objects,
                  keys=data.Keyset(
                    fragment=fragment.hexdigest(),
                    data=keys), **properties)
