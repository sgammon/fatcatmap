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
goog.require('model');
goog.require('models.search');

goog.provide('models.graph');

if (support.storage.local)
  new services.storage.Store(window.localStorage, 'graph', 'graph');

/**
 * @constructor
 * @extends {model.Model}
 * @param {!(string|model.Key)} key
 * @throws {TypeError} If key is not a string or Key.
 */
models.graph.GraphItem = function (key) {
  model.Model.call(this, key);

  /**
   * @expose
   * @type {model.KeyList.<string>}
   */
  this.classes = new model.KeyList();

  /**
   * @private
   * @type {Object}
   */
  this.__descriptors__ = {};
};

util.object.inherit(models.graph.GraphItem, model.Model);

util.object.mixin(models.graph.GraphItem, /** @lends {models.graph.GraphItem.prototype} */{
  /**
   * Enriches the current graph item with passed context.
   * @param {Object} context
   * @return {models.graph.GraphItem}
   */
  enrich: function (context) {
    this.classes.push(this.key.kind.toLowerCase());
    return this;
  },

  /**
   * Adds a descriptor to the current graph item by name.
   * @param {(string|Object.<string, *>)} property
   * @param {*} value
   * @return {models.graph.GraphItem}
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
   * @return {models.graph.GraphItem}
   */
  put: function () {
    if (services.storage.graph)
      services.storage.graph.set(this.key, this);

    model.Model.prototype.put.call(this);

    return this;
  }
});

/**
 * @constructor
 * @extends {models.graph.GraphItem}
 * @param {!(string|model.Key)} key
 * @throws {TypeError} If key is not a string or Key.
 */
models.graph.GraphNode = function (key) {
  models.graph.GraphItem.call(this, key);

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
   * @type {model.KeyIndexedList.<models.graph.GraphEdge>}
   */
  this.edges = new model.KeyIndexedList();

  this.classes.push('node');
};

util.object.inherit(models.graph.GraphNode, models.graph.GraphItem);

util.object.mixin(models.graph.GraphNode, /** @lends {models.graph.GraphNode.prototype} */{
  /**
   * @expose
   * @param {models.graph.GraphNode} node
   * @return {models.graph.GraphNode}
   * @throws {Error} If source node's key doesn't match target node's key.
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
   * @return {Array.<models.graph.GraphNode>}
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

util.object.extend(models.graph.GraphNode, /** @lends {models.graph.GraphNode} */{
  /**
   * @override
   * @param {(Object.<{data: Object}>|*)} data
   * @return {boolean}
   */
  validate: function (data) {
    if (!data)
      return true;

    if (!data.data)
      return !(data.hasOwnProperty('peers') || data.hasOwnProperty('source'));

    return !(data.data.hasOwnProperty('peers') || data.data.hasOwnProperty('source'));
  }
});

/**
 * @constructor
 * @extends {models.graph.GraphItem}
 * @param {!(string|model.Key)} key
 * @throws {TypeError} If key is not a string or Key.
 */
models.graph.GraphEdge = function (key) {
  models.graph.GraphItem.call(this, key);

  /**
   * @expose
   * @type {?models.graph.GraphNode}
   */
  this.source = null;

  /**
   * @expose
   * @type {?models.graph.GraphNode}
   */
  this.target = null;

  this.classes.push('link');
};

util.object.inherit(models.graph.GraphEdge, models.graph.GraphItem);

util.object.mixin(models.graph.GraphEdge, /** @lends {models.graph.GraphEdge.prototype} */{
  /**
   * @expose
   * @param {models.graph.GraphEdge} edge
   * @return {models.graph.GraphEdge}
   * @throws {Error} If source edge's key doesn't match current edge's key.
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
   * Returns whether current models.graph.GraphEdge has both source and target.
   * @expose
   * @return {boolean}
   */
  satisfied: function () {
    return this.source && this.target;
  },

  /**
   * Associates a GraphEdge to a particular GraphNode.
   * @expose
   * @param {models.graph.GraphNode} node
   * @throws {TypeError} If passed node is not a GraphNode.
   */
  link: function (node) {
    if (!(node instanceof models.graph.GraphNode))
      throw new TypeError('models.graph.GraphEdge.link() expects a models.graph.GraphNode as the only parameter.');

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
   * @param {models.graph.GraphNode} node
   * @return {?models.graph.GraphNode}
   * @throws {TypeError} If passed node is not a GraphNode.
   */
  peer: function (node) {
    if (!(node instanceof models.graph.GraphNode))
      throw new TypeError('models.graph.GraphEdge.peer() expects a models.graph.GraphNode as the only parameter.');

    if (this.source && node.key.equals(this.source.key))
      return this.target;

    if (this.target && node.key.equals(this.target.key))
      return this.source;

    console.warn('Can\'t get peer on edge ' + this.key + ' for unlinked node ' + node.key + '.');
  }
});


/**
 * @constructor
 * @param {models.graph.GraphData=} graph
 */
models.graph.Graph = function (graph) {
  /**
   * @expose
   * @type {model.KeyIndexedList.<models.graph.GraphNode>}
   */
  this.nodes = new model.KeyIndexedList();

  /**
   * @expose
   * @type {model.KeyIndexedList.<models.graph.GraphEdge>}
   */
  this.edges = new model.KeyIndexedList();

  /**
   * @expose
   * @type {?Object.<{index: number, key: model.Key}>}
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
   * @type {model.KeyList.<string>}
   */
  this._fragments = new model.KeyList();

  if (graph)
    this.unpack(graph);
};

util.object.mixin(models.graph.Graph, /** @lends {models.graph.Graph.prototype} */{
  /**
   * @param {models.graph.GraphData} packed
   * @return {models.graph.Graph}
   */
  unpack: function (packed) {
    var graph = this,
      keys = packed.data.keys,
      objects = packed.data.objects,
      i, key, data, node, edge, source, target;

    graph.nodes = new model.KeyIndexedList().merge(graph.nodes);
    graph.edges = new model.KeyIndexedList().merge(graph.edges);

    for (i = 0; i < keys.length; i++) {
      key = keys[i];
      data = objects[i];

      if (!key || !data) {
        console.warn('models.graph.Graph.unpack() got empty key or data: ' + key + ', ' + data);
        break;
      }

      if (models.graph.GraphNode.validate(data.get())) {
        node = new models.graph.GraphNode(key, data);
        
        if (data.data)
          node.enrich(data.data);

        if (data.descriptors)
          node.describe(data.descriptors);

        graph.nodes.push(node);
        continue;
      }

      data = data.get();

      if (data.peers) {
        source = graph.nodes.get(keys[data.peers[0]]);
        target = graph.nodes.get(keys[data.peers[1]]);
      } else {
        source = graph.nodes.get(keys[data.source]);
        target = graph.nodes.get(keys[data.target]);
      }

      edge = new models.graph.GraphEdge(key);

      if (source)
        edge.link(source);

      if (target)
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
   * @return {(models.graph.Graph|Object.<{nodes: KeyIndexedList, edges: KeyIndexedList}>)}
   */
  trim: function (cache) {
    var nodes = new model.KeyIndexedList(),
      edges = new model.KeyIndexedList(),
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
   * Removes a node from the graph and any subsequently isolated subgraphs.
   * @param {(string|model.Key|models.graph.GraphNode)} node
   * @param {boolean=} cache If true, will return the untrimmed node and edge lists.
   * @return {(models.graph.Graph|Object.<{nodes: KeyIndexedList, edges: KeyIndexedList}>)}
   * @throws {TypeError} If node is not a GraphNode, Key or string key.
   */
  prune: function (node, cache) {
    var nodes = new model.KeyIndexedList(),
      edges = new model.KeyIndexedList(),
      pruned = {
        nodes: {},
        edges: {}
      },
      peers, cached;

    while (!(node instanceof models.graph.GraphNode)) {
      if (node instanceof model.Key || typeof node === 'string') {
        node = this.nodes.get(node);
      } else {
        throw new TypeError('models.graph.Graph.prune() accepts a models.graph.GraphNode, node Key or string node key.');
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
models.graph.Graph.prototype.id;

Object.defineProperty(models.graph.Graph.prototype, 'id', {
  /**
   * @expose
   * @type {boolean}
   */
  enumerable: true,

  /**
   * @expose
   * @this {models.graph.Graph}
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
 * @param {!models.graph.Graph} graph
 * @param {(string|model.Key)=} origin
 * @param {models.graph.GraphQueryOptions=} options
 * @throws {TypeError} If graph is not defined.
 */
models.graph.GraphQuery = function (graph, origin, options) {
  if (!(graph instanceof models.graph.Graph))
    throw new TypeError('models.graph.GraphQuery() expects a graph as the first parameter.');

  options = options || {};

  /**
   * @type {?(string|model.Key)}
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
  this.keys_only = typeof options.keys_only === 'boolean' ? options.keys_only : false;

  /**
   * @type {boolean}
   */
  this.collections = typeof options.collections === 'boolean' ? options.collections : true;

  /**
   * @type {boolean}
   */
  this.descriptors = typeof options.descriptors === 'boolean' ? options.descriptors : true;

  return models.search.Query.call(this, options.limit || 10);
};

util.object.inherit(models.graph.GraphQuery, models.search.Query);
