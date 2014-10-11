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
goog.require('services.rpc');
goog.require('services.data');
goog.require('services.search');

goog.provide('services.graph');

var GRAPH, Graph, GraphQuery;

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
   * @type {models.KeyIndexedList.<string>}
   */
  this._fragments = new models.KeyIndexedList().key(function (frag) {
    return frag;
  });

  if (graph)
    this.unpack(graph);
};

/**
 * @param {GraphData} packed
 * @return {Graph}
 */
Graph.prototype.unpack = function (packed) {
  var graph = this,
    keys = packed.data.keys,
    objects = packed.data.objects,
    structure = packed.graph.structure.split(':'),
    offset = packed.graph.boundary - 1,
    edges = {},
    edge, i, key;

  graph.nodes = new models.KeyIndexedList().merge(graph.nodes);
  graph.edges = new models.KeyIndexedList().merge(graph.edges);

  for (i = 0; i < structure.length; i++) {
    key = keys.get(i + offset);

    if (!key) {
      console.warn('Graph.unpack() received ' + (structure.length - i + offset) +
        'extra structures.');
      break;
    }

    if (!edges[key]) {
      if (structure[i])
        structure[i].split(',').forEach(function (edgeI) {
          var edgeKey;
          edgeI = +edgeI;
          edgeKey = keys.get(edgeI);

          if (edgeKey && !edges[edgeKey])
            edges[edgeKey] = objects[edgeI].data.peers.map(function (i) { return keys.get(i); });
        });

      if (key.parent)
        graph.nodes.push(new models.graph.GraphNode(key).enrich(objects[i].data));
    }
  }

  for (key in edges) {
    if (edges.hasOwnProperty(key)) {
      edge = new models.graph.GraphEdge(key);
      edge.link(graph.nodes.get(edges[key][0]))
      edge.link(graph.nodes.get(edges[key][1]));

      if (!edge.satisfied()) {
        console.warn('Graph.unpack() built incomplete edge: ');
        console.warn(edge)
      } else {
        graph.edges.push(edge);
      }
    }
  }

  graph.session = packed.session;
  graph.origin = {
    key: keys[packed.graph.origin],
    index: graph.nodes.index[keys[packed.graph.origin]]
  };

  graph._fragments.push(packed.meta.fragment);

  return graph;
};

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
 * @extends {Query}
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
  
  return services.rpc.graph.construct({
    data: request
  });
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
   * @param {GraphData} graph
   * @this {ServiceContext}
   */
  load: function (graph) {
    if (this.graph.active)
      return this.graph.active.unpack(graph);
  },

  /**
   * @expose
   * @param {(string|models.key.Key)=} origin
   * @param {GraphQueryOptions=} options
   * @param {boolean=} replace
   * @return {Future}
   * @this {ServiceContext}
   */
  construct: function (origin, options, replace) {
    var graph = this.graph,
      response = new Future();

    replace = !!replace;

    if (!this.graph.active) {
      response.fulfill(false,
        new Error('No active graph to query. Call services.graph.init() first.'));
    } else {
      new GraphQuery(graph.active, origin, options)
        .execute()
        .then(function (v, e) {
          if (!v && e) {
            graph.emit('error', e);
            return response.fulfill(false, e);
          }

          if (v.data && v.data['error_message'])
            return response.fulfill(false, v.data);

          graph.emit('response', v);

          v = /** @type {GraphData} */ (v.data);

          v.data.keys = models.Key.unpack(v.data.keys, v.meta.kinds);

          if (replace)
            graph.inject('graph.active', new Graph());

          try {
            response.fulfill(graph.active.unpack(v));
          } catch (e) {
            debugger;
            response.fulfill(false, e);
          }
        });
    }

    return response;
  },

  /**
   * @expose
   * @param {GraphData=} graph
   * @param {string=} session
   * @param {function()=} cb
   * @this {ServiceContext}
   */
  init: function (graph, session, cb) {
    this.inject('graph.active', new Graph(graph, session));

    window['GRAPH'] = this.graph.active;

    this.graph.on('response', function (response) {
      console.log('GraphQuery response:');
      console.log(response);
    });

    if (cb)
      cb(graph);
  }
}.service('graph');
