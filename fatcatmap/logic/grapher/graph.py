# -*- coding: utf-8 -*-

'''

  fcm: graph objects

'''

# stdlib
import collections

# local
from . import options

# models
from canteen import model
from fatcatmap.models import Vertex, Edge


class Graph(object):

  ''' Object representing a single ``Graph``, composed of ``Vertex`` and
      ``Edge`` records in the underlying storage layer.

      Keeps track of structural keys encountered during the traversal process
      and manages the retrieval of their native data records, if requested. '''

  # Options
  __options__ = None  # grapher options
  __streaming__ = None  # streaming mode
  __options_class__ = options.GraphOptions  # options class to use

  # Storage
  __nodes__ = None  # node storage
  __edges__ = None  # edge storage
  __origin__ = None  # origin node
  __natives__ = None  # native objects

  # Models
  __node_model__ = Vertex  # node model to use
  __edge_model__ = Edge  # edge model to use

  # Indexes
  __keys__ = None  # seen keys
  __adjacency__ = None  # adjacency matrix
  __node_edges__ = None  # node -> edge index
  __natives_seen__ = None  # all seen native keys
  __natives_held__ = None  # native keys we have
  __natives_pending__ = None  # native keys we want

  # State
  __node_count__ = 0  # count of nodes
  __edge_count__ = 0  # count of edges
  __native_count__ = 0  # count of natives
  __fulfilled__ = False  # flag indicating full dataset
  __node_native_kinds__ = None  # gathered kinds of edge natives
  __edge_native_kinds__ = None  # gathered kinds of edge natives

  def __init__(self, origin, options=None):

    ''' Initialize the local graph object.

        :param origin: Originating ``Vertex`` to start the ``Graph`` building
          process with.

        :param options: ``GraphOptions`` instance describing parameters for the
          desired graph operation. Defaults to ``None``, in which case a default
          set of ``GraphOptions`` is spawned for the developer's convenience.

        :raises TypeError: If the value passed at ``options`` (to be used as
          ``GraphOptions``) is of an invalid or unknown type.  '''

    if options and not isinstance(options, self.__options_class__):
      raise TypeError('Must pass `options` object of expected `GraphOptions`'
                      ' class (set to "%s").' % self.__options_class__)

    # populate default storage and empty indexes
    self.__keys__, self.__nodes__, self.__edges__, self.__natives__ = (
      set(), {}, {}, {})

    # native kind indexes
    self.__node_native_kinds__, self.__edge_native_kinds__ = (
      set(), set())

    # native indexes
    self.__natives_seen__, self.__natives_held__, self.__natives_pending__ = (
      set(), set(), set())

    # node and adjacency indexes
    self.__adjacency__, self.__node_edges__ = {}, {}

    # populate origin and options (or defaults if none were provide)
    self.__origin__, self.__streaming__, self.__options__ = (
      origin, False, options or self.__options_class__.default())

  ## == Internals == ##
  def _traverse(self, node, _current_depth=1):

    ''' Traverse through ``node`` and keep track of current recursion depth.

        :param node: Node to traverse through, optionally continuing to
          recurse if the local ``GraphOptions`` so allow.

        :yields: ``node`` key being traversed, then any resolved ``edge`` key
          records, then the fetched ``node`` and ``edge`` objects, then linked
          ``native`` data records for both types. '''

    if node:
      yield self.add_node(node)  # consider node

      # resolve edges & add
      for edge in self._retrieve_edges(node):
        yield self.add_edge(edge)

        for node_key in edge.node:
          node = Vertex.get(node_key)  # retrieve node

          if node:
            for artifact in self._traverse(node, _current_depth + 1):
              yield artifact

    # check depth
    if self.options.depth and _current_depth > self.options.depth:
      raise StopIteration()  # terminate recursion: depth reached

    raise StopIteration()  # recursion has finished: return

  def _enter_context(self):

    ''' Enter context handler, for use with Python's ``with`` statement.
        Prevents recursive use of live state in any one ``Graph`` object
        during concurrent use via realtime dispatch.

        :returns: ``self``, for chainability and use with the ``as``-after-
          ``with``-block. '''

    if self.__streaming__:
      raise RuntimeError('Cannot nest streaming contexts for Graph objects.')

    # we are now going _faster_
    return setattr(self, '__streaming__', True) or self

  def _exit_context(self, exception_type, exception, traceback):

    ''' Exit context handler, for use with Python's ``with`` statement.
        Never suppresses exceptions... *for now!*

        :param exception_type: Type (class) for the current ``exception``, or
          ``None`` if no exception ocurred.

        :param exception: Inner exception object from wrapped ``with`` block, or
          ``None`` if no exception ocurred.

        :param traceback: Matching traceback for ``exception`` object from
          wrapped ``with`` block, or ``None`` if no exception ocurred.

        :returns: In the event of an ``exception``, returns ``False`` to refuse
          the option of supressing it. '''

    if exception:
      # @TODO(sgammon): is there anything internal to be suppressed?
      return False  # never suppress exceptions (for now)
    return True

  def _retrieve_edges(self, node):

    ''' Generate a query to iterate over a target ``node``'s edges, then
        immediately execute and iterate over those results.

        :param node: Target ``Vertex`` for which ``Edge`` records should be
          retrieved.

        :yields: Discovered ``Edge`` records according to the subject ``node``,
          one at a time, according to the currently-active ``GraphOptions``. '''

    query = Edge.query().filter(Edge.node == node.key.urlsafe())

    # query and retrieve edges
    for edge in query.fetch(limit=self.options.limit):
      yield edge

  def _fulfill_natives(self):

    ''' Internal method to trigger the retrieval of native data matching
        structural keys encountered during graph traversal. '''

    from fatcatmap import models

    fulfilled = set()
    for pending in self.__natives_pending__:

      native = models.AppModel.get(pending)

      if native:
        # move from pending to held
        self.__natives_held__.add(pending)
        fulfilled.add(pending)
        self.__natives__[pending] = native
        yield native
        continue

    for done in fulfilled:
      self.__natives_pending__.remove(done)

  def _enqueue_native(self, parent, encoded_key):

    ''' Enqueue a native data record to be retrieved when needed. Called
        during the traversal process to keep track of native dependencies.

        :param parent:
        :param encoded_key:

        :returns: '''

    # inflate native key
    native_key = model.Key(urlsafe=encoded_key)

    if native_key not in self.__natives_seen__:

      # add to indexes & counts
      self.__native_count__ += 1
      self.__natives_seen__.add(native_key)
      self.__natives_pending__.add(native_key)

      # add kind to index
      {
        self.__node_model__.kind(): self.__node_native_kinds__,
        self.__edge_model__.kind(): self.__edge_native_kinds__
      }.get(parent.kind).add(native_key.kind)

  def _update_edge_indexes(self, edge_key, edge_nodes):

    ''' Update local indexes for an encountered ``Edge`` ``key`` and pair of
        ``nodes``.

        :param edge_key: Target ``Edge`` key to update local indexes for.
        :param edge_nodes: Peered ``Vertex`` keys to update local indexes
          for. '''

    for node_key_left in edge_nodes:
      for node_key_right in edge_nodes:

        # init sets
        if node_key_left not in self.__adjacency__:
          self.__adjacency__[node_key_left] = set()
        if node_key_right not in self.__adjacency__:
          self.__adjacency__[node_key_right] = set()

        self.__adjacency__[node_key_left].add((
          '::'.join((node_key_right, edge_key.urlsafe()))))
        self.__adjacency__[node_key_right].add((
          '::'.join((node_key_left, edge_key.urlsafe()))))

      node_key = node_key_left  # switch contexts: done with comparison

      # update node -> edge index
      if node_key not in self.__node_edges__:
        self.__node_edges__[node_key] = set((node_key,))
      else:
        self.__node_edges__[node_key].add(edge_key)

  ## == Nodes == ##
  def add_node(self, node):

    ''' Add a node to the local graph.

        :param node: ``Vertex`` to add to the local graph.

        :raises TypeError: If the target ``Vertex`` is not an instance of this
          ``Graph``'s bound ``__node_model__``.

        :returns: The resulting ``node`` as it was added to the local graph. '''

    if not isinstance(node, self.__node_model__):
      raise TypeError('Must pass `node` of bound Node'
                      ' model type to `Graph.add_node`.'
                      ' Instead, got type: "%s".' % type(node))

    # check against key and add
    if node.key not in self.__keys__:
      self.__nodes__[node.key] = node
      self.__keys__.add(node.key)
      self.__node_count__ += 1

      # queue native, if needed
      self._enqueue_native(node.key, node.native)

    return node

  def has_node(self, node):

    ''' Check to see if the local graph contains ``node``.

        :param node: ``Vertex`` to check against the local graph for ownership.

        :raises TypeError: If the target ``Vertex`` is not an instance of this
          ``Graph``'s bound ``__node_model__``.

        :returns: ``bool`` value indicating whether ``node`` is contained by the
          local graph object. '''

    if isinstance(node, self.__node_model__): node = node.key
    if not isinstance(node, model.Key):
      raise TypeError('Must pass `node` of type `model.Key`'
                      ' or bound Nodemodel to `Graph.has_node`.')
    return node in self.__nodes__

  ## == Edges == ##
  def add_edge(self, edge):

    ''' Add an edge to the local graph.

        :param edge: ``Edge`` to add to the local graph.
        :returns: The resulting ``edge`` as it was added to the graph. '''

    # check against key and add
    if edge.key not in self.__keys__:
      self.__edges__[edge.key] = edge
      self.__keys__.add(edge.key)
      self.__edge_count__ += 1

      # queue native, maybe
      self._enqueue_native(edge.key, edge.native)

      # update adjacency
      self._update_edge_indexes(edge.key, edge.node)

    return edge

  def has_edge(self, edge):

    ''' Check to see if the local graph contains ``edge``.

        :param edge: ``Edge`` to check for membership against the local graph.
        :raises TypeError: If a ``edge`` key is passed which is not an instance
          of ``model.Key`` or is of an invalid or unknown kind.

        :returns: ``bool`` value indicating whether ``edge`` is contained by the
          local graph object. '''

    if isinstance(edge, self.__edge_model__): edge = edge.key
    if not isinstance(edge, model.Key): raise TypeError('`edge` must be an'
                                                        '``Edge`` key')
    return edge in self.__edges__

  ## == Output == ##
  def extract(self, flatten=False):

    ''' Extract the local graph object into a compact and efficient structure,
        suitable for encoding in a raw object and passing to a client.

        :param flatten: Flatten models to ``dict`` values recursively, such that
          the output object is ready for encoding from something like JSON.

        :returns: 3-tuple of the items ``meta``, ``data``, and ``graph``, which
          transmit *metadata*, *full object data/keys*, and *graph structure*,
          respectively. Keys and objects are stored in an abstracted and
          extremely space-efficient manner and subsequently referenced with
          integer ``list`` indexes only. '''

    # create lookup sets
    _seen_nodes, _seen_edges, _seen_natives = set(), set(), set()
    _bound_natives, _bound_nodes, _bound_edges = set(), set(), set()
    _invalid_edges = set()

    # create empty local data containers and indexes
    _keys, _nodes, _edges, _natives, _origin_i = [], [], [], [], None

    _edges_to_nodes, _nodes_to_edges, _nodes_to_nodes, _keys_to_indexes = (
      collections.defaultdict(lambda: set()) for x in xrange(0, 4))

    _keys_to_objects, _objects_to_natives, _natives_to_objects = (
      collections.defaultdict(lambda: set()) for x in xrange(0, 3))

    # utility routines
    _flatten_index = lambda index: list((([k] + list(v)) if (
      isinstance(v, set)) else (k, v)) for k, v in index.iteritems())

    # populate data containers and indexes
    for iterator in (self.nodes, self.edges, self.natives):

      for artifact in iterator:

        encoded_key = artifact.key.urlsafe()

        # handle nodes...
        if isinstance(artifact, self.__node_model__):

          if encoded_key in _seen_nodes:
            continue

          # provision key
          _key_i = _keys.append(encoded_key) or (len(_keys) - 1)
          _keys_to_indexes[encoded_key] = _key_i  # map encoded key to key index

          # map key index to serialized object
          _keys_to_objects[_key_i] = artifact.to_dict() if flatten else artifact

          # map to node index
          _node_i = (_nodes.append(_key_i) or len(_nodes) - 1)

          # lookin' for the origin
          if (not _origin_i) and self.origin.key.urlsafe() == encoded_key:
            _origin_i = _node_i

          # leave ourselves a hint about the native
          _natives_to_objects[artifact.native] = _key_i

          # add to seen lists
          _seen_nodes.add(encoded_key)
          _bound_nodes.add(encoded_key)
          _seen_natives.add(artifact.native)

        # handle edges...
        elif isinstance(artifact, self.__edge_model__):

          if encoded_key in _seen_edges:
            continue

          # add to seen lists
          _seen_edges.add(encoded_key)

          if any((node not in _keys_to_indexes for node in artifact.node)):
            _invalid_edges.add(encoded_key)
            continue  # cancel processing for this edge: it is invalid

          # provision edge & key
          _key_i = _keys.append(encoded_key) or (len(_keys) - 1)

          # map encoded key to key index
          _keys_to_indexes[encoded_key] = _key_i

          # map key index to serialized object
          _keys_to_objects[_key_i] = artifact.to_dict() if flatten else artifact

          # map to node index
          _edge_i = (_edges.append(_key_i) or len(_edges) - 1)

          # leave ourselves a hint about the native
          _natives_to_objects[artifact.native] = _key_i

          # add to seen lists
          _seen_natives.add(artifact.native)
          _bound_edges.add(encoded_key)  # this edge is A-OK

          for node in artifact.node:

            _seen_nodes.add(node)

            # resolve node index
            _node_i = _nodes.index(_keys_to_indexes[node])

            _nodes_to_edges[_node_i].add(_edge_i)  # node -> edge
            _edges_to_nodes[_edge_i].add(_node_i)  # edge -> node

            _node_to_node_map = set()
            for node_right in artifact.node:

              # don't ever map to self
              if node == node_right:
                continue

              if (node, node_right) not in _node_to_node_map:

                # resolve right node's index and map (node -> node)
                _nodes_to_nodes[_node_i].add((
                  _nodes.index(_keys_to_indexes[node_right])))
                _node_to_node_map.add((node, node_right))

        # handle natives...
        else:
          # did we keep this native's edge/node? if not, don't send it
          if (encoded_key not in _natives_to_objects):
            continue

          # perhaps we already bound this native?
          elif encoded_key in _bound_natives:
            _objects_to_natives[_key_i] = (  # artifact -> existing native
              _natives.index(_keys.index(encoded_key)))
            continue

          # provision native & key
          _key_i = _keys.append(encoded_key) or (len(_keys) - 1)

          # map encoded key to key index
          _keys_to_indexes[encoded_key] = _key_i

          # map key index to serialized object
          _keys_to_objects[_key_i] = artifact.to_dict() if flatten else artifact

          # map to node index
          _native_i = (_natives.append(_key_i) or len(_natives) - 1)

          _bound_natives.add(encoded_key)
          _objects_to_natives[_key_i] = _native_i  # artifact -> native

    # generate error summary
    _missing_nodes, _missing_natives = (
      _seen_nodes - _bound_nodes,
      _seen_natives - _bound_natives
    )

    return {

      ## == metadata == ##

      # compact counts
      'counts': [len(_nodes), len(_edges), len(_natives)],

      'errors': [  # compact error stats
        len(_missing_nodes), len(_invalid_edges), len(_missing_natives)],

      'natives': self.fulfilled,  # bool: are natives included?
      'options': self.options.to_struct(),  # dictionary: options for graph

      'kinds': {  # list of mentioned node native kinds
        'node': tuple(self.node_native_kinds) or tuple(),
        'edge': tuple(self.edge_native_kinds) or tuple()}

    }, {

      ## == raw data == ##
      'keys': _keys,
      'objects': _keys_to_objects,
      'index': {
        'node_edges': _flatten_index(_nodes_to_edges),
        'object_natives': _objects_to_natives,
        'map': _flatten_index(_nodes_to_nodes)
      }

    }, {

      ## == graph == ##
      'nodes': max(_nodes) if _nodes else 0,
      'edges': max(_edges) if _edges else 0,
      'natives': max(_natives) if _natives else 0,
      'origin': _origin_i if _nodes else None

    }

  ## == Top-level == ##
  def build(self, fulfill=True, iter=False):

    ''' Build the target graph as specified by local ``GraphOptions`` and the
        caller's desire to ``fulfill`` (fill-out) structural key data.

        :param fulfill: ``bool`` flag indicating that the caller would like full
          object data returned as part of this request's response.

        :param iter: ``bool`` flag indicating that we wish to enable a fully-
          iterative flow, such as in a websocket/realtime dispatch-style
          environment.

        :returns: If ``iter`` mode is requested, a closured function is returned
          that acts as a generator and provides access to all object types as
          they are encountered in the traversal process, yielded one-at-a-time.
          If ``iter`` mode is not active, the iterative process is exhausted
          according to ``GraphOptions`` limits and returned as a synchronous
          structure. '''

    # fulfill origin, if needed
    if isinstance(self.__origin__, model.Key):
      self.__origin__ = self.__node_model__.get(self.__origin__)

    # build iterator
    def _iter_graph_builder():

      ''' Iteratively traverse and provide graph ``Vertex``es, ``Edge``es, and
          ``Native``es to the callee, starting from ``self.origin`` and working
          outwards according to ``self.options``.

          :yields: Artifacts encountered during traversal, one at a time.
            Once those are exhausted for a single browse cycle, ``native``
            records are also sent (assuming ``fulfill`` mode is active). '''

      for artifact in self._traverse(self.origin):
        yield artifact
      if fulfill:
        for native in self._fulfill_natives():
          yield native
        self.__fulfilled__ = True  # mark graph as filled
      raise StopIteration()

    # if the user wants to stream, hand back iterator directly
    if self.__streaming__: return _iter_graph_builder()

    for artifact in _iter_graph_builder():
      continue  # guess nobody cares... :(

    return self  # non-streaming return

  ## == Overrides == ##
  __call__ = extract

  ## == Properties == ##

  # Internals
  __enter__, __exit__ = _enter_context, _exit_context

  # Data
  nodes = property(lambda self: self.__nodes__.itervalues())
  edges = property(lambda self: self.__edges__.itervalues())
  natives = property(lambda self: self.__natives__.itervalues())
  adjacency = property(lambda self: self.__adjacency__)

  # Query Info
  origin = property(lambda self: self.__origin__)
  options = property(lambda self: self.__options__)
  fulfilled = property(lambda self: self.__fulfilled__)

  # Counts
  item_count = property(lambda self: len(self.__keys__))
  node_count = property(lambda self: self.__node_count__)
  edge_count = property(lambda self: self.__edge_count__)
  native_count = property(lambda self: self.__native_count__)

  # Native Kinds
  node_native_kinds = property(lambda self: self.__node_native_kinds__)
  edge_native_kinds = property(lambda self: self.__edge_native_kinds__)
