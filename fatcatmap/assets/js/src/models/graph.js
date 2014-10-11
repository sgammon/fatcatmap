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
goog.require('models');
goog.require('models.data');

goog.provide('models.graph');

var GraphItem, GraphNode, GraphEdge;

if (support.storage.local)
  new services.storage.Store(window.localStorage, 'graph', 'graph');

/**
 * @constructor
 * @extends {models.data.Entity}
 * @param {!(string|models.Key)} key
 * @throws {TypeError} If key is not a string or Key.
 */
GraphItem = function (key) {
  models.data.Entity.call(this, key);

  /**
   * @expose
   * @type {models.KeyIndexedList.<string>}
   */
  this.classes = new models.KeyIndexedList().key(function (x) { return x; });
};

util.object.inherit(GraphItem, models.data.Entity);

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
   * Persists the current graph item into the graph Store.
   * @return {GraphItem}
   */
  put: function () {
    if (services.storage.graph)
      services.storage.graph.set(this.key, this);

    Entity.prototype.put.call(this);

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
    if (!(node.key.toString() === this.key.toString()))
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
  GraphEdge: GraphEdge
};
