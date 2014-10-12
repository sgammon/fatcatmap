/**
 * @fileoverview Lightweight service wrapper for fatcatmap RPC.
 *
 * @author  David Rekow <david@momentum.io>,
 *          Sam Gammon <sam@momentum.io>,
 *          Alex Rosner <alex@momentum.io>,
 *          Ian Weisberger <ian@momentum.io>
 * 
 * copyright (c) momentum labs, 2014
 */

goog.require('util.url');
goog.require('services');
goog.require('services.http');

goog.provide('services.rpc');

var _baseRPCURL = '/_rpc/v1/',
  RPCAPI;

/**
 * @constructor
 * @extends {ServiceContext}
 * @param {string} name
 * @param {Array.<string>} methods
 * @param {Object=} config
 */
RPCAPI = function (name, methods, config) {
  var api = this;

  api.name = name;
  api.config = config;

  methods.forEach(function (method) {

    var endpoint = util.url.join(_baseRPCURL, api.name + '.' + method);

    /**
     * @param {Request} request
     * @param {PipelinedCallback=} handler
     * @return {Future|Response}
     * @this {ServiceContext}
     */
    api[method] = function (request, handler) {
      request = {
        url: endpoint,
        data: request.data || {},
        params: request.params || {},
        headers: request.headers || {}
      };

      /**
       * @expose
       */
      request.headers.Accept = 'application/json';

      request.headers['Content-Type'] = 'application/json';

      return this.http.post(request, handler);
    }.inject('http');

  });
};


/**
 * @expose
 */
services.rpc = /** @lends {ServiceContext.prototype.rpc} */{

  /**
   * @param {Array} manifest
   */
  factory: function (manifest) {
    var name = manifest[0];

    if (typeof name === 'string')
      services.rpc[name] = new RPCAPI(name, manifest[1], manifest[2]);
  },

  /**
   * @param {Array} manifests
   */
  init: function (manifests) {
    manifests.forEach(services.rpc.factory);
  }
}.service('rpc');