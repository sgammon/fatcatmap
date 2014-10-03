/**
 * @fileoverview Fatcatmap graphing service.
 *
 * @author  David Rekow <david@momentum.io>,
 *          Sam Gammon <sam@momentum.io>,
 *          Alex Rosner <alex@momentum.io>,
 *          Ian Weisberger <ian@momentum.io>
 * 
 * copyright (c) momentum labs, 2014
 */

goog.require('support');
goog.require('service');
goog.require('services.rpc');
goog.require('services.data');
goog.require('services.search');

goog.provide('services.graph');

var Graph, GraphQuery;

/**
 * @constructor
 * @param {GraphData=} graph
 * @param {string=} session
 */
Graph = function (graph, session) {
  /**
   * @type {Array.<models.graph.Node>}
   */
  this.nodes = [];

  /**
   * @type {Array.<models.graph.Edge>}
   */
  this.edges = [];

  /**
   * @type {?Node}
   */
  this.origin = null;

  /**
   * @type {?string}
   */
  this.session = session || null;

  if (graph)
    this.add(graph);
};

/**
 * @static
 * @param {GraphData} packed
 * @return {Object}
 */
Graph.unpack = function (packed) {
  return {};
};

/**
 * Adds graph data to the current instance.
 * @param {GraphData} graph
 */
Graph.prototype.add = function (graph) {
  graph = Graph.unpack(graph);
};

/**
 * @constructor
 * @extends {Query}
 * @param {!Graph} graph
 * @param {string=} origin
 * @param {GraphQueryOptions=} options
 * @throws {TypeError} If graph is not defined.
 */
GraphQuery = function (graph, origin, options) {
  if (!(graph instanceof Graph))
    throw new TypeError('GraphQuery() expects a graph as the first parameter.');

  options = options || {};

  /**
   * @type {?string}
   */
  this.origin = origin || graph.origin;

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

  return Query.call(this, options.limit || 10);
};

util.object.inherit(GraphQuery, Query);

/**
 * @override
 * @param {GraphQueryOptions=} options
 * @return {Future}
 */
GraphQuery.prototype.execute = function (options) {
  var request = {};

  options = options || {};

  options.depth = options.depth || this.depth;
  options.limit = options.limit || this.limit;
  options.cached = options.cached || this.cached;
  options.keys_only = options.keys_only || this.keys_only;

  request.options = options;
  request.origin = this.origin;
  request.session = this.session;
  request.filters = this.filters;
  
  return services.rpc.graph.construct(request);
};

/**
 * @expose
 */
services.graph = /** @lends {ServiceContext.prototype.graph} */ {
  /**
   * @expose
   * @type {?Graph}
   */
  active: null,

  /**
   * @expose
   * @type {?services.storage.Store}
   */
  storage: (
    support.storage.local ?
    new services.storage.Store(window.localStorage, 'graph', 'graph') :
    null),

  /**
   * @expose
   * @type {cache.LRUCache}
   */
  cache: new cache.LRUCache(100),

  /**
   * @expose
   * @param {GraphData=} graph
   * @param {string=} session
   * @param {function()=} cb
   * @this {ServiceContext}
   */
  init: function (graph, session, cb) {
    this.inject('graph.active', new Graph(graph, session));

    if (cb)
      cb(graph);
  },

  /**
   * @expose
   * @param {GraphData} graph
   * @this {ServiceContext}
   */
  load: function (graph) {
    if (this.graph.active)
      return this.graph.active.add(graph);

    this.init(graph);
  },

  /**
   * @expose
   * @param {string=} origin
   * @param {GraphQueryOptions=} options
   * @return {Future}
   * @this {ServiceContext}
   */
  construct: function (origin, options) {
    if (!this.graph.active)
      this.init();

    return new GraphQuery(this.graph.active, origin).execute(options);
  }
}.service('graph');
