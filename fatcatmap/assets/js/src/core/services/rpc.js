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

goog.require('async');
goog.require('urlutil');
goog.require('services.http');

goog.provide('services.rpc');

var baseURL = '/_rpc/v1/',
  RPCAPI;

/**
 * @constructor
 * @param {string} name
 * @param {Array.<string>} methods
 * @param {Object=} config
 */
RPCAPI = function (name, methods, config) {
  var api = this;

  api.name = name;
  api.config = config;

  methods.forEach(function (method) {

    var endpoint = urlutil.join(baseURL, api.name + '.' + method);

    /**
     * @param {Request} request
     * @param {CallbackMap=} handlers
     */
    api[method] = function (request, handlers) {
      var req = {
        url: endpoint,
        data: request.data || {},
        params: request.params || {},
        headers: request.headers || {},
      };

      req.headers['Accept'] = 'application/json';
      req.headers['Content-Type'] = 'application/json';

      return services.http.post(req, handlers)
    };

  });
};


/**
 * @expose
 */
services.rpc = {

  /**
   * @param {Array} manifest
   * @expose
   */
  factory: function (manifest) {
    var name = manifest[0];
    services.rpc[name] = new RPCAPI(name, manifest[1], manifest[2]);
  },

  /**
   * @param {Array} manifests
   * @expose
   */
  init: function (manifests) {
    manifests.forEach(services.rpc.factory);
  }
};