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
#_DEFAULT_ORIGIN = "OlBlcnNvbjozMTY6TGVnaXNsYXRvcjpQMDAwMTk3"
_DEFAULT_ORIGIN = "OlBlcnNvbjo0NTQ6TGVnaXNsYXRvcjpIMDAxMDY4"


def pack_key(key, kinds, lookup, graph):

  ''' Pack a key into an efficient structure that is
      efficient for transmission.

      :param key:
      :param kinds:
      :param lookup:

      :returns: '''

  if key.parent:
    if graph.options.collections:
      packed = (kinds.index(key.kind), key.id, lookup[key.parent])
    else:
      packed = (kinds.index(key.kind), key.id, key.parent.urlsafe())
  else:
    packed = (kinds.index(key.kind), key.id)
  return ":".join(map(unicode, packed))


@bind('graph')
class Grapher(logic.Logic):

  ''' Provides logic that is capable of traversing and
      recursively exploring FCM's Redis-based graph. '''

  caching = True  # graph caching
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
    graph = gstruct.GraphResponse.get(model.Key(gstruct.GraphResponse, fragment),
                              adapter=models.BaseModel.__adapter__)

    if graph and not self.caching: graph.delete()
    elif graph and self.caching:
      graph.session = session or str(uuid.uuid4())
      return graph

    # build graph & optionally fulfill
    graph = Graph(models.BaseModel.__adapter__, options=options).traverse(origin)
    if not options.keys_only: graph.fulfill()

    if not export: return graph

    response = self.export(graph, session, gstruct.GraphResponse)
    response.key = model.Key(gstruct.GraphResponse, fragment)

    response.meta.options['cached'] = True
    if self.caching: response.put(adapter=models.BaseModel.__adapter__)

    response.meta.options['cached'] = False
    response.session = session or str(uuid.uuid4())
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

    from fatcatmap import models
    from fatcatmap.services.graph import messages

    # pack metadata
    kinds, options, origin = (
      [i for i in sorted(graph.kinds)],
      graph.options.serialize(),
      None)

    keys, keypack, objects, opack, packed, plookup = [], [], [], [], set(), {}

    for key in graph.keys:

      if key not in packed:

        packed.add(key)
        keys.append(key)
        plookup[key] = len(keys) - 1

        if not graph.options.keys_only:
          obj = graph.objects[key]

          # handle empty objects
          if obj is struct.EMPTY:
            objects.append(None)
          else:

            # empty objects
            if obj is None:
              obj = graph.adapter.registry[key.kind](key=key)
            objects.append(obj)

    # pack objects if not keys only
    if graph.options.keys_only:
      keypack = map(lambda x: pack_key(x, kinds, plookup, graph), keys)

    else:
      for obj in objects:

        keypack.append(pack_key(obj.key, kinds, plookup, graph))

        # rollup `peers` and `source`/`target`
        if hasattr(obj, '__edge__'):
          if hasattr(obj, 'peers'):
            if isinstance(obj.peers[0], (basestring, model.Key)):
              _symbolic = []
              for pk in obj.peers:
                _symbolic.append(plookup[pk])
              obj.peers = _symbolic

          elif hasattr(obj, 'source'):
            if isinstance(obj.source, (basestring, model.Key)):
              obj.source = plookup[pk]

          elif hasattr(obj, 'target'):
            if isinstance(obj.target, (basestring, model.Key)):
              obj.target = plookup[pk]

        obj_dict = obj.to_dict() if not isinstance(obj, dict) else obj

        dsc, item = (
          graph.descriptors[obj.key] if (graph.options.media or graph.options.stats) else {},
          messages.GraphObject(data=obj_dict) if obj_dict else messages.GraphObject())

        # pack descriptors if we have any
        if dsc:
          dsc_flattened = {}

          for keypath, descriptor in dsc.iteritems():

            # flatten into known path
            subpath = keypath.split('.')
            if subpath[0] not in dsc_flattened:
              dsc_flattened[subpath[0]] = {}
            dsc_flattened[subpath[0]][subpath[-1]] = descriptor.to_dict()

          item.descriptors = dsc_flattened

        opack.append(item)

    origin = plookup[graph.origin]

    return message(**{

      'meta': messages.Meta(**{
        'kinds': kinds,
        'cached': cached,
        'options': options,
        'counts': [len(graph.vertices), len(graph.edges)],
        'fragment': Graph.fragment(graph.origin, graph.options)
      }),

      'data': messages.Data(**{
        'keys': keypack,
        'objects': opack
      }),

      'origin': origin})
