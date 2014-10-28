/**
 * @fileoverview Fatcatmap graph models.
 *
 * @author  David Rekow <david@momentum.io>,
 *          Sam Gammon <sam@momentum.io>,
 *          Alex Rosner <alex@momentum.io>,
 *          Ian Weisberger <ian@momentum.io>
 *
 * copyright (c) momentum labs, 2014
 */
goog.require('util.object');
goog.require('support');
goog.require('services.storage');
goog.require('services.search');
goog.require('models');
goog.require('models.data');
goog.require('models.search');

goog.provide('models.graph');

var GraphItem, GraphNode, GraphEdge, Graph, GraphQuery;

if (support.storage.local)
  new services.storage.Store(window.localStorage, 'graph', 'graph');

/**
 * @constructor
 * @extends {models.data.KeyedData}
 * @param {!(string|models.Key)} key
 * @throws {TypeError} If key is not a string or Key.
 */
GraphItem = function (key) {
  models.data.KeyedData.call(this, key);

  /**
   * @expose
   * @type {models.KeyList.<string>}
   */
  this.classes = new models.KeyList();

  /**
   * @private
   * @type {Object}
   */
  this.__descriptors__ = {};
};

util.object.inherit(GraphItem, models.data.KeyedData);

util.object.mixin(GraphItem, /** @lends {GraphItem.prototype} */{
  /**
   * Enriches the current graph item with passed context.
   * @param {Object} context
   * @return {GraphItem}
   */
  enrich: function (context) {
    this.classes.push(this.key.kind.toLowerCase());
    return this;
  },

  /**
   * Adds a descriptor to the current graph item by name.
   * @param {(string|Object.<string, *>)} property
   * @param {*} value
   * @return {GraphItem}
   */
  describe: function (property, value) {
    if (typeof property === 'object') {
      value = property;

      for (property in value) {
        if (value.hasOwnProperty(property))
          this.describe(property, value[property]);
      }
    } else {
      if (!this.hasOwnProperty(property))
        Object.defineProperty(this, property, {
          /**
           * @expose
           * @type {boolean}
           */
          enumerable: true,

          /**
           * @expose
           * @return {*}
           */
          get: function () {
            return value;
          },

          /**
           * @expose
           * @param {*} val
           */
          set: function (val) {
            value = val;
          }
        });

      this[property] = value;
    }

    return this;
  },

  /**
   * Persists the current graph item into the graph Store.
   * @return {GraphItem}
   */
  put: function () {
    if (services.storage.graph)
      services.storage.graph.set(this.key, this);

    KeyedData.prototype.put.call(this);

    return this;
  }
});

/**
 * @constructor
 * @extends {GraphItem}
 * @param {!(string|models.Key)} key
 * @throws {TypeError} If key is not a string or Key.
 */
GraphNode = function (key) {
  GraphItem.call(this, key);

  /**
   * @expose
   * @type {number}
   */
  this.x = 0;

  /**
   * @expose
   * @type {number}
   */
  this.y = 0;

  /**
   * @expose
   * @type {number}
   */
  this.px = 0;

  /**
   * @expose
   * @type {number}
   */
  this.py = 0;

  /**
   * @expose
   * @type {models.KeyIndexedList.<GraphEdge>}
   */
  this.edges = new models.KeyIndexedList();

  this.classes.push('node');
};

util.object.inherit(GraphNode, GraphItem);

util.object.mixin(GraphNode, /** @lends {GraphNode.prototype} */{
  /**
   * @expose
   * @param {GraphNode} node
   * @return {GraphNode}
   * @throws {Error} If node's key doesn't match current GraphNode's key.
   */
  merge: function (node) {
    if (!this.key.equals(node.key))
      throw new Error('Cannot merge node ' + node.key + ': does not match current ' + this.key);

    this.edges.merge(node.edges);
    this.classes.merge(node.classes);
    return this;
  },

  /**
   * Returns both source and target as a list.
   * @expose
   * @return {Array.<GraphNode>}
   */
  peers: function () {
    var node = this;
    return this.edges.map(function (edge) {
      return edge.peer(node);
    });
  },

  /**
   * Returns true if the current node has only one edge.
   * @expose
   * @return {boolean}
   */
  isLeaf: function () {
    return this.edges.length === 1;
  }
});

/**
 * @constructor
 * @extends {GraphItem}
 * @param {!(string|models.Key)} key
 * @throws {TypeError} If key is not a string or Key.
 */
GraphEdge = function (key) {
  GraphItem.call(this, key);

  /**
   * @expose
   * @type {?GraphNode}
   */
  this.source = null;

  /**
   * @expose
   * @type {?GraphNode}
   */
  this.target = null;

  this.classes.push('link');
};

util.object.inherit(GraphEdge, GraphItem);

util.object.mixin(GraphEdge, /** @lends {GraphEdge.prototype} */{
  /**
   * @expose
   * @param {GraphEdge} edge
   * @return {GraphEdge}
   * @throws {Error} If edge's key doesn't match current GraphEdge's key.
   */
  merge: function (edge) {
    var sourceKey, targetKey;

    if (!edge.key.equals(this.key))
      throw new Error('Cannot merge edge ' + edge.key + ': does not match current ' + this.key);

    if (edge.source) {
      sourceKey = edge.source.key;

      if (this.satisfied()) {
        if (!(sourceKey.equals(this.source.key) || sourceKey.equals(this.target.key)))
          throw new Error('Can\'t merge edge ' + edge.key + ': too many nodes.');
      } else {
        if (this.source) {
          this.target = edge.source;
        } else {
          this.source = edge.source;
        }
      }
    }

    if (edge.target) {
      targetKey = edge.target.key;

      if (this.satisfied()) {
        if (!(targetKey.equals(this.source.key) || targetKey.equals(this.target.key)))
          throw new Error('Can\'t merge edge ' + edge.key + ': too many nodes.');
      } else {
        if (this.source) {
          this.target = edge.target;
        } else {
          this.source = edge.target;
        }
      }
    }

    return this;
  },

  /**
   * Returns whether current GraphEdge has both source and target.
   * @expose
   * @return {boolean}
   */
  satisfied: function () {
    return this.source && this.target;
  },

  /**
   * Associates a GraphEdge to a particular GraphNode.
   * @expose
   * @param {GraphNode} node
   * @throws {TypeError} If passed node is not a GraphNode.
   */
  link: function (node) {
    if (!(node instanceof GraphNode))
      throw new TypeError('GraphEdge.link() expects a GraphNode as the only parameter.');

    if (this.satisfied()) {
      console.warn('Can\'t link edge ' + this.key + ' to node ' + node.key + ', too many peers.');
      return;
    }

    if (this.source) {
      this.target = node;
    } else {
      this.source = node;
    }

    node.edges.push(this);
  },

  /**
   * Returns the other GraphNode associated with this GraphEdge.
   * @expose
   * @param {GraphNode} node
   * @return {?GraphNode}
   * @throws {TypeError} If passed node is not a GraphNode.
   */
  peer: function (node) {
    if (!(node instanceof GraphNode))
      throw new TypeError('GraphEdge.peer() expects a GraphNode as the only parameter.');

    if (this.source && node.key.equals(this.source.key))
      return this.target;

    if (this.target && node.key.equals(this.target.key))
      return this.source;

    console.warn('Can\'t get peer on edge ' + this.key + ' for unlinked node ' + node.key + '.');
  }
});


/**
 * @constructor
 * @param {GraphData=} graph
 */
Graph = function (graph) {
  /**
   * @expose
   * @type {models.KeyIndexedList.<models.graph.GraphNode>}
   */
  this.nodes = new models.KeyIndexedList();

  /**
   * @expose
   * @type {models.KeyIndexedList.<models.graph.GraphEdge>}
   */
  this.edges = new models.KeyIndexedList();

  /**
   * @expose
   * @type {?Object.<{index: number, key: models.Key}>}
   */
  this.origin = null;

  /**
   * @expose
   * @type {?string}
   */
  this.session = null;

  /**
   * @private
   * @type {?string}
   */
  this._id = null;

  /**
   * @private
   * @type {models.KeyList.<string>}
   */
  this._fragments = new models.KeyList();

  if (graph)
    this.unpack(graph);
};

util.object.mixin(Graph, /** @lends {Graph.prototype} */{
  /**
   * @param {GraphData} packed
   * @return {Graph}
   */
  unpack: function (packed) {
    var graph = this,
      keys = packed.data.keys,
      objects = packed.data.objects,
      i, key, data, node, edge, source, target;

    graph.nodes = new models.KeyIndexedList().merge(graph.nodes);
    graph.edges = new models.KeyIndexedList().merge(graph.edges);

    for (i = 0; i < keys.length; i++) {
      key = keys[i];
      data = objects[i];

      if (!key || !data) {
        console.warn('Graph.unpack() got empty key or data: ' + key + ', ' + data);
        break;
      }

      if (!data || !data.data ||
          !(data.data.hasOwnProperty('peers') || data.data.hasOwnProperty('source'))) {
        node = new GraphNode(key);
        
        if (data.data)
          node.enrich(data.data);

        if (data.descriptors) {
          node.describe(data.descriptors);
        }

        graph.nodes.push(node);
        continue;
      }

      data = data.data;

      if (data.peers) {
        source = graph.nodes.get(keys[data.peers[0]]);
        target = graph.nodes.get(keys[data.peers[1]]);
      } else {
        source = graph.nodes.get(keys[data.source]);
        target = graph.nodes.get(keys[data.target]);
      }

      edge = new GraphEdge(key);

      edge.link(source);
      edge.link(target);

      graph.edges.push(edge);
    }

    graph.session = packed.session;
    graph.origin = {
      key: keys[packed.origin],
      index: graph.nodes.index[keys[packed.origin]]
    };

    graph._fragments.push(packed.meta.fragment);

    return graph;
  },

  /**
   * Removes all leaf nodes and their links.
   * @param {boolean=} cache If true, will return the untrimmed node and edge lists.
   * @return {(Graph|Object.<{nodes: KeyIndexedList, edges: KeyIndexedList}>)}
   */
  trim: function (cache) {
    var nodes = new models.KeyIndexedList(),
      edges = new models.KeyIndexedList(),
      cached;

    this.nodes.forEach(function (node) {
      if (!node.isLeaf())
        nodes.push(node);
    });

    this.edges.forEach(function (edge) {
      if (edge.satisfied() && !(edge.source.isLeaf() || edge.target.isLeaf()))
        edges.push(edge);
    });

    if (cache === true)
      cached = {
        nodes: this.nodes,
        edges: this.edges,
        origin: this.origin
      };

    this.nodes = nodes;
    this.edges = edges;

    return cached || this;
  },

  /**
   * Removes a node from the graph, trimming any subsequently isolated subgraphs.
   * @param {(string|models.Key|GraphNode)} node
   * @param {boolean=} cache If true, will return the untrimmed node and edge lists.
   * @return {(Graph|Object.<{nodes: KeyIndexedList, edges: KeyIndexedList}>)}
   * @throws {TypeError} If node is not a GraphNode, Key or string key.
   */
  prune: function (node, cache) {
    var nodes = new models.KeyIndexedList(),
      edges = new models.KeyIndexedList(),
      pruned = {
        nodes: {},
        edges: {}
      },
      peers, cached;

    while (!(node instanceof GraphNode)) {
      if (node instanceof Key || typeof node === 'string') {
        node = this.nodes.get(node);
      } else {
        throw new TypeError('Graph.prune() accepts a GraphNode, node Key or string node key.');
      }
    }

    if (cache === true)
      cached = {
        nodes: this.nodes,
        edges: this.edges,
        origin: this.origin
      };

    if (!node.key.equals(this.origin.key)) {
      pruned.nodes[node.key] = true;

      node.edges.forEach(function (edge) {
        var peer = edge.peer(node);

        pruned.edges[edge.key] = true;

        if (peer.isLeaf()) {
          pruned.nodes[peer.key] = true;
        } else {
          peer.edges.splice(peer.edges.index[edge.key], 1);
        }
      });

      this.nodes.forEach(function (node) {
        if (!pruned.nodes[node.key])
          nodes.push(node);
      });

      this.edges.forEach(function (edge) {
        if (!pruned.edges[edge.key])
          edges.push(edge);
      });
    } else {
      this.origin = null;
    }

    this.nodes = nodes;
    this.edges = edges;

    return cached || this;
  }
});

/**
 * @expose
 * @return {string}
 */
Graph.prototype.id;

Object.defineProperty(Graph.prototype, 'id', {
  /**
   * @expose
   * @type {boolean}
   */
  enumerable: true,

  /**
   * @expose
   * @this {Graph}
   * @return {string}
   */
  get: function () {
    if (!this._id || this._id.length !== (
        (4 * this._fragments.length) + (2 * (this._fragments.length - 1))))
      this._id = this._fragments.map(function (fragment) {
        return fragment.slice(-4);
      })
        .sort().join('::');

    return this._id;
  }
});


/**
 * @constructor
 * @extends {models.search.Query}
 * @param {!Graph} graph
 * @param {(string|models.Key)=} origin
 * @param {GraphQueryOptions=} options
 * @throws {TypeError} If graph is not defined.
 */
GraphQuery = function (graph, origin, options) {
  if (!(graph instanceof Graph))
    throw new TypeError('GraphQuery() expects a graph as the first parameter.');

  options = options || {};

  /**
   * @type {?(string|models.Key)}
   */
  this.origin = origin || (graph.origin ? graph.origin.key : null);

  /**
   * @type {?string}
   */
  this.session = graph.session;

  /**
   * @type {number}
   */
  this.depth = options.depth || 2;

  /**
   * @type {boolean}
   */
  this.cached = typeof options.cached === 'boolean' ? options.cached : true;

  /**
   * @type {boolean}
   */
  this.keys_only = typeof options.keys_only === 'boolean' ? options.keys_only : true;

  return models.search.Query.call(this, options.limit || 10);
};

util.object.inherit(GraphQuery, models.search.Query);


/**
 * @expose
 */
models.graph = {
  /**
   * @constructor
   * @extends {models.KeyedItem}
   * @param {(string|models.Key)} key
   * @throws {TypeError} If key is not a string or Key.
   */
  GraphNode: GraphNode,

  /**
   * @constructor
   * @extends {models.KeyedItem}
   * @param {(string|models.Key)} key
   * @throws {TypeError} If key is not a string or Key.
   */
  GraphEdge: GraphEdge,

  /**
   * @constructor
   * @param {GraphData=} graph
   */
  Graph: Graph,

  /**
   * @constructor
   * @extends {models.search.Query}
   * @param {!Graph} graph
   * @param {(string|models.Key)=} origin
   * @param {GraphQueryOptions=} options
   * @throws {TypeError} If graph is not defined.
   */
  GraphQuery: GraphQuery
};
