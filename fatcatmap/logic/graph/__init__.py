# -*- coding utf-8 -*-

'''

  fcm: graph logic

'''

# stdlib
import uuid

# local
from .options import Options
from .container import Graph

# canteen
from canteen import bind
from canteen import model
from canteen import logic
from canteen import struct


## Globals
_DEFAULT_ORIGIN = "OlBlcnNvbjoyMzQ0OkxlZ2lzbGF0b3I6NDAwMjYz"


def pack_key(key, kinds, lookup):

  ''' Pack a key into an efficient structure that is
      efficient for transmission.

      :param key:
      :param kinds:
      :param lookup:

      :returns: '''

  if key.parent: return (kinds.index(key.kind), key.id, lookup[key.parent])
  return (kinds.index(key.kind), key.id)


@bind('graph')
class Grapher(logic.Logic):

  ''' Provides logic that is capable of traversing and
      recursively exploring FCM's Redis-based graph. '''

  caching = False  # graph caching
  options = Options  # attach graph options

  def construct(self, session, origin, export=True, **options):

    ''' Construct a full ``Graph`` object, given a starting
        ``origin`` node and traversal ``options``.

        Optionally, bind to a ``session`` or cancel ``export``
        of the raw ``Graph`` instance.

        :param session: Session UUID to bind this graph object
          to when exporting a response.

        :param origin: Origin ``Vertex`` key to start recursive
          traversal from.

        :param export: Boolean flag controlling whether the
          ``Graph`` instance is exported into a ``GraphResponse``
          message instance. Defaults to ``True``.

        :param options: Keyword arguments are taken as graph
          traversal options.

        :returns: Prepared ``Graph`` instance, or a prepared
          ``GraphResponse`` wrapping a ``Graph`` instance if
          ``export`` is passed as truthy. '''

    from fatcatmap import models
    from fatcatmap.services.graph import messages as gstruct

    # get options and origin
    options, origin = Options(**options), (
      origin or model.Key.from_urlsafe(_DEFAULT_ORIGIN))

    # check cache
    fragment = Graph.fragment(origin, options)
    graph = gstruct.Graph.get(model.Key(gstruct.GraphResponse, fragment),
                              adapter=models.BaseModel.__adapter__)

    if graph and not self.caching: graph.delete()
    elif graph and self.caching:
      return self.export(graph, session, gstruct.GraphResponse, cached=True)

    # build graph & optionally fulfill
    graph = Graph(models.BaseModel.__adapter__, options=options).traverse(origin)
    if not options.keys_only: graph.fulfill()

    if not export: return graph

    response = self.export(graph, session, gstruct.GraphResponse)
    response.key = model.Key(gstruct.GraphResponse, fragment)
    if self.caching: response.put(adapter=models.BaseModel.__adapter__)
    return response

  def export(self, graph, session, message, cached=False):

    ''' Export a constructed ``Graph`` instance into a response
        structure suitable for handing to the frontend.

        :param graph: ``Graph`` instance to export to a ``GraphResponse``
          object, minus things the client already has.

        :param session: Session UUID string to bind to when considering
          what to include in the ``GraphResponse``.

        :param message: Message class to export ``Graph`` instance data
          to. Usually ``GraphResponse`.

        :param cached: Boolean flag indicating whether this ``Graph``
          instance came from a cache or actual data.

        :returns: ``GraphResponse`` instance, prepared with wrapped
          ``Graph`` instance. '''

    from fatcatmap.services.graph import messages

    # pack metadata
    kinds, options, origin = (
      [i for i in sorted(graph.kinds)],
      graph.options.serialize(),
      graph.lookup[graph.origin])

    keys, objects, structure = [], [], ''

    # pack objects if not keys only
    if not graph.options.keys_only:
      for key in graph.keys:
        obj = graph.objects[key]
        keys.append(pack_key(key, kinds, graph.lookup))

        # handle empty objects
        if obj is struct.EMPTY:
          objects.append(None)
        else:

          # rollup `peers` and `source`/`target`
          if hasattr(obj, '__edge__'):
            if hasattr(obj, 'peers'):
              if isinstance(obj.peers[0], (basestring, model.Key)):
                _symbolic = []
                for pk in obj.peers:
                  _symbolic.append(graph.lookup[pk])
                obj.peers = _symbolic

            elif hasattr(obj, 'source'):
              if isinstance(obj.source, (basestring, model.Key)):
                obj.source = graph.lookup[pk]

            elif hasattr(obj, 'target'):
              if isinstance(obj.target, (basestring, model.Key)):
                obj.target = graph.lookup[pk]

          dsc, item = (
            graph.descriptors[key] if graph.options.descriptors else {},
            messages.GraphObject(data=obj.to_dict()))

          # pack descriptors if we have any
          if dsc: item.descriptors = dsc
          objects.append(item)

    return message(**{

      'session': session or str(uuid.uuid4()),

      'meta': messages.Meta(**{
        'kinds': kinds,
        'cached': cached,
        'options': options,
        'counts': [len(graph.vertices), len(graph.edges)],
        'fragment': Graph.fragment(graph.origin, graph.options)
      }),

      'data': messages.Data(**{
        'keys': keys,
        'objects': objects
      }),

      'graph': messages.Graph(**{
        'origin': origin,
        'structure': structure
      })})
