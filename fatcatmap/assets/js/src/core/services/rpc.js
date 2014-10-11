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
goog.require('async.future');
goog.require('service');
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
      var response = new Future();

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

      this.http.post(request, function (value, error) {
        if (error)
          return response.fulfill(false, error);

        if (value.data && value.data.error_message)
          return response.fulfill(false, new Error(value.data.error_message));

        response.fulfill(value);
      });

      if (handler)
        response.then(handler);

      return response;
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