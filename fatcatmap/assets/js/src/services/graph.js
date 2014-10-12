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

goog.require('util.object');
goog.require('support');
goog.require('service');
goog.require('models');
goog.require('models.graph');
goog.require('models.search');
goog.require('services.rpc');
goog.require('services.data');

goog.provide('services.graph');

var _graphCache, _graphStore, _graphIndex, GRAPH, GraphQuery;

_graphCache = {};

if (supports.storage.local)
  _graphStore = new Store(window.localStorage, 'graph', 'graph');

_graphIndex = {
  adjacency: {},
  nodesByKey: {},
  edgesByKey: {}
};

/**
 * @constructor
 * @extends {models.search.Query}
 * @param {!Graph} graph
 * @param {(string|models.key.Key)=} origin
 * @param {GraphQueryOptions=} options
 * @throws {TypeError} If graph is not defined.
 */
GraphQuery = function (graph, origin, options) {
  if (!(graph instanceof Graph))
    throw new TypeError('GraphQuery() expects a graph as the first parameter.');

  options = options || {};

  /**
   * @type {?(string|models.key.Key)}
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
 * @override
 * @return {Future}
 */
GraphQuery.execute = function () {
  var request = this.spec;

  request.filters = this.filters;
  
  return services.rpc.graph.construct(request);
};

/**
 * @expose
 */
services.graph = /** @lends {ServiceContext.prototype.graph} */ {
  /**
   * @param {Object|PageData} data Graph data to initialize with.
   * @return {Object} Constructed graph object.
   * @this {ServiceContext}
   */
  init: function (data) {
    GRAPH = this.graph.construct(data.graph, data.data);
    return GRAPH;
  },

  /**
   * @param {Object} graph Graph index.
   * @param {Object} data Graph data.
   * @return {Object} Graph object.
   * @this {ServiceContext}
   */
  construct: function (graph, data) {

    if (!graph)
      return GRAPH;

    GRAPH = {
      nodes: [],
      edges: [],
      natives: [],
      origin: graph.origin,
      origin_key: data.keys[graph.origin]
    };

    return this.graph.add(graph, data);
  },

  /**
   * @param {Object} graph Graph index.
   * @param {Object} data Graph data.
   * @return {Object} Graph object.
   * @this {ServiceContext}
   */
  add: function (graph, data) {
    var makeEdge, i, keys, key, node, nativeKey, _native, targets, source;

    makeEdge = function (source, key) {
      /*jshint eqnull:true */
      return function (target) {
        var _i;

        if (!_graphIndex.adjacency[source] || !_graphIndex.adjacency[source][target]) {
          if (_graphIndex.nodesByKey[source] == null)
            console.warn('Making edge with unencountered source ' + source);

          if (_graphIndex.nodesByKey[target] == null)
            console.warn('Making edge with unencountered target ' + target);

          _i = GRAPH.edges.push({
            'key': key,
            'source': _graphIndex.nodesByKey[source],
            'target': _graphIndex.nodesByKey[target]
          }) - 1;

          _graphIndex.edgesByKey[key].push(_i);

          _graphIndex.adjacency[source] = {};
          _graphIndex.adjacency[source][target] = _i;
        }
      };
    };

    i = 0;
    keys = data.keys;

    while (i < keys.length) {
      key = keys[i];

      if (i <= graph.nodes) {

        if (!_graphIndex.nodesByKey[key]) {

          node = {
            key: key,
            classes: ['node']
          };

          nativeKey = data.objects[i]['native'];
          _native = data.objects[keys.indexOf(nativeKey)];

          if (_native.govtrack_id) {
            node.classes.push('legislator');
            node.classes.push(_native.gender === 'M' ? 'male' : 'female');
            node.classes.push(Math.ceil(Math.random() * 100) % 2 ? 'democrat' : 'republican');
            if (Math.random() < 0.1869)
              node.classes.push('senate');
          } else {
            node.classes.push('contributor');
            node.classes.push(_native.contributor_type == 'C' ? 'corporate' : 'individual');
          }

          _graphIndex.nodesByKey[key] = GRAPH.nodes.push(node) - 1;
        }
      } else if (i <= graph.edges) {

        if (!_graphIndex.edgesByKey[key])
          _graphIndex.edgesByKey[key] = [];

        targets = data.objects[i].node.slice();
        source = targets.shift();

        targets.forEach(makeEdge(source, key));
      }
      i++;
    }

    return this.graph.get();
  },

  /**
   * @return {Object} Graph object.
   */
  get: function () {
    return GRAPH;
  }
}.service('graph');
