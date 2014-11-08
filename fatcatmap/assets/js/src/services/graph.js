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
goog.require('model');
goog.require('models.graph');
goog.require('service');
goog.require('services.rpc');
goog.require('services.data');

goog.provide('services.graph');

/**
 * @override
 * @param {GraphQueryOptions=} options
 * @return {Future}
 */
models.graph.GraphQuery.prototype.execute = function (options) {
  var request = {};

  options = options || {};

  options.depth = options.depth || this.depth;
  options.limit = options.limit || this.limit;
  options.cached = options.cached || this.cached;
  options.keys_only = options.keys_only || this.keys_only;
  options.collections = options.collections || this.collections;
  options.descriptors = options.descriptors || this.descriptors;

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
   * @type {?models.graph.Graph}
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
   * @param {GraphData} graph
   * @this {ServiceContext}
   */
  load: function (graph) {
    if (this.services.graph.active)
      return this.services.graph.active.unpack(graph);
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
    var graph = this,
      response = new Future();

    replace = !!replace;

    if (!graph.active) {
      response.fulfill(false,
        new Error('No active graph to query. Call services.graph.init() first.'));
    } else {
      new models.graph.GraphQuery(graph.active, origin, options)
        .execute()
        .then(function (v, e) {
          if (!v && e) {
            graph.emit('error', e);
            return response.fulfill(false, e);
          }

          if (v.data && v.data['error_message'])
            return response.fulfill(false, v.data);

          graph.emit('response', v);

          v = /** @type {GraphData#data} */ (graph.services.data.receiveAll(v.data));

          if (replace === true)
            graph.active = new models.graph.Graph();

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
   * @param {function()=} cb
   * @this {ServiceContext}
   */
  init: function (graph, cb) {
    this.active = new models.graph.Graph(graph);

    /** @expose */
    window.graphdata = graph;

    if (cb)
      cb(this.active);
  }
}.service('graph');
