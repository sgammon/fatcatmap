# -*- coding: utf-8 -*-

'''

  fcm: graph objects

'''

# local
from . import options

# models
from canteen import model
from fatcatmap.models.graph.node import Node
from fatcatmap.models.graph.edge import Edge


class Graph(object):

  '''  '''

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
  __node_model__ = Node  # node model to use
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

    '''  '''

    if options and not isinstance(options, self.__options_class__):
      raise TypeError('Must pass `options` object of expected `GraphOptions`'
                      ' class (set to "%s").' % self.__options_class__)

    # populate default storage and empty indexes
    self.__keys__, self.__nodes__, self.__edges__, self.__natives__ = set(), {}, {}, {}

    # native kind indexes
    self.__node_native_kinds__, self.__edge_native_kinds__ = set(), set()

    # native indexes
    self.__natives_seen__, self.__natives_held__, self.__natives_pending__ = set(), set(), set()

    # node and adjacency indexes
    self.__adjacency__, self.__node_edges__ = {}, {}

    # populate origin and options (or defaults if none were provide)
    self.__origin__, self.__streaming__, self.__options__ = origin, False, options or self.__options_class__.default()

  ## == Internals == ##
  def _traverse(self, node, _current_depth=1):

    '''  '''

    yield self.add_node(node)  # consider node

    # check depth
    if self.options.depth and _current_depth > self.options.depth:
      raise StopIteration()  # terminate recursion: depth reached

    # resolve edges & add
    for edge in self._retrieve_edges(node):
      yield self.add_edge(edge)

      for node_key in edge.node:
        node = Node.get(node_key)  # retrieve node

        if node:
          for artifact in self._traverse(node, _current_depth+1):
            yield artifact

    raise StopIteration()  # recursion has finished: return

  def _enter_context(self):

    '''  '''

    if self.__streaming__:
      raise RuntimeError('Cannot nest streaming contexts for Graph objects.')
    return setattr(self, '__streaming__', True) or self  # we are now going _faster_

  def _exit_context(self, exception_type, exception, traceback):

    '''  '''

    if exception:
      # @TODO(sgammon): is there anything internal to be suppressed?
      return False  # never suppress exceptions (for now)
    return True

  def _retrieve_edges(self, node):

    '''  '''

    # query and retrieve edges
    for edge in Edge.query().filter(Edge.node == node.key.urlsafe()).fetch(limit=self.options.limit):
      yield edge

  def _fulfill_natives(self):

    '''  '''

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

    '''  '''

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

    '''  '''

    for node_key_left in edge_nodes:
      for node_key_right in edge_nodes:

        # init sets
        if node_key_left not in self.__adjacency__:
          self.__adjacency__[node_key_left] = set()
        if node_key_right not in self.__adjacency__:
          self.__adjacency__[node_key_right] = set()

        self.__adjacency__[node_key_left].add(node_key_right)
        self.__adjacency__[node_key_right].add(node_key_left)

      node_key = node_key_left  # switch contexts: done with comparison

      # update node -> edge index
      if node_key not in self.__node_edges__:
        self.__node_edges__[node_key] = set((node_key,))
      else:
        self.__node_edges__[node_key].add(edge_key)

  ## == Nodes == ##
  def add_node(self, node):

    '''  '''

    if not isinstance(node, self.__node_model__):
      raise TypeError('Must pass `node` of bound Node'
                      ' model type to `Graph.add_node`.')

    # check against key and add
    if node.key not in self.__keys__:
      self.__nodes__[node.key] = node
      self.__keys__.add(node.key)
      self.__node_count__ += 1

      # queue native, if needed
      self._enqueue_native(node.key, node.native)

    return node

  def has_node(self, node):

    '''  '''

    if isinstance(node, self.__node_model__): node = node.key
    if not isinstance(node, model.Key):
      raise TypeError('Must pass `node` of type `model.Key`'
                      ' or bound Nodemodel to `Graph.has_node`.')
    return node in self.__nodes__

  ## == Edges == ##
  def add_edge(self, edge):

    '''  '''

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

    '''  '''

    if isinstance(edge, self.__edge_model__): edge = edge.key
    if not isinstance(edge, model.Key): raise TypeError('')

  ## == Output == ##
  def to_struct(self):

    '''  '''

    return (
      { # = meta = #
        'node_count': self.node_count,  # count of unique nodes
        'edge_count': self.edge_count,  # count of unique edges
        'native_count': self.native_count,  # count of unique native objects
        'node_kinds': tuple(self.node_native_kinds) or tuple(),  # list of mentioned node native kinds
        'edge_kinds': tuple(self.edge_native_kinds) or tuple(),  # list of mentioned edge native kinds
        'natives': self.fulfilled,  # bool: are natives included?
        'options': self.options.to_struct()  # dictionary: options for this graph query
      },
      { # = data = #
        'nodes': self.nodes,  # iterator to full node list
        'edges': self.edges,  # iterator to full edge list
        'origin': self.origin,  # origin model object
        'natives': self.natives,  # native objects (both edges + nodes)
        'adjacency': dict(((k, list(v)) for k, v in self.adjacency.iteritems()))  # adjacency matrix
      }
    )

  ## == Top-level == ##
  def build(self, fulfill=True, iter=False):

    '''  '''

    # fulfill origin, if needed
    if isinstance(self.__origin__, model.Key):
      self.__origin__ = self.__node_model__.get(self.__origin__)

    # build iterator
    def _iter_graph_builder():

      '''  '''

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
