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
goog.require('models.data');

goog.provide('models.graph');

var GraphNode, GraphEdge;

/**
 * @constructor
 * @extends {models.data.KeyedItem}
 * @param {!(string|models.data.Key)} key
 * @throws {TypeError} If key is not a string or Key.
 */
GraphNode = function (key) {
  KeyedItem.call(this, key);

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
   * @type {Array.<string>}
   */
  this.classes = ['node'];

  /**
   * @expose
   * @type {models.data.KeyIndexedList}
   */
  this.edges = new models.data.KeyIndexedList();
};

util.object.inherit(GraphNode, models.data.KeyedItem);

util.object.mixin(GraphNode, /** @lends {GraphNode.prototype} */{
  /**
   * Enriches the current node with passed context.
   * @param {Object} context
   * @return {GraphNode}
   */
  enrich: function (context) {
    this.classes.push(this.key.kind.toLowerCase());
    return this;
  }
});

/**
 * @constructor
 * @extends {models.data.KeyedItem}
 * @param {!(string|models.data.Key)} key
 * @throws {TypeError} If key is not a string or Key.
 */
GraphEdge = function (key) {
  KeyedItem.call(this, key);

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

util.object.inherit(GraphEdge, models.data.KeyedItem);

util.object.mixin(GraphEdge, /** @lends {GraphEdge.prototype} */{
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
   * @throws {TypeError} If index is not a GraphNode.
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
  }
});

/**
 * @expose
 */
models.graph = {
  /**
   * @constructor
   * @extends {models.data.KeyedItem}
   * @param {(string|models.data.Key)} key
   * @throws {TypeError} If key is not a string or Key.
   */
  GraphNode: GraphNode,

  /**
   * @constructor
   * @extends {models.data.KeyedItem}
   * @param {(string|models.data.Key)} key
   * @throws {TypeError} If key is not a string or Key.
   */
  GraphEdge: GraphEdge
};
