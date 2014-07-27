/**
 * @fileoverview Imports service as a directory.
 *
 * @author  David Rekow <david@momentum.io>,
 *          Sam Gammon <sam@momentum.io>,
 *          Alex Rosner <alex@momentum.io>,
 *          Ian Weisberger <ian@momentum.io>
 * 
 * copyright (c) momentum labs, 2014
 */

goog.require('services.rpc');
goog.require('services.http');
goog.require('services.storage');

goog.provide('services');

/**
 * Service-injected class.
 * @constructor
 */
var Client = function () {};

Client.prototype = services;

/**
 * @expose
 * @return {function(...)}
 */
Function.prototype.client = function () {
  var fn = this;

  return function () {
    return fn.apply(new Client(), arguments);
  };
};

/**
 * @expose
 * @param {string} name Service name.
 * @return {function(...)}
 */
Function.prototype.service = function (name) {
  Client.prototype[name] = this.client();
  return Client.prototype[name];
};


Object.defineProperty(Object.prototype, 'service', {
  /**
   * @param {string} name Service name.
   * @return {Object.<string, function(...)>}
   * @throws {Error|TypeError}
   */
  value: /** @this {Object} */ function (name) {
    var obj = this,
      method;
    if (!name || typeof name !== 'string')
      throw new TypeError('service() requires a string name.');

    if (obj.constructor !== Object)
      throw new Error('service() can only be invoked on native objects.');

    for (var prop in obj) {
      if (obj.hasOwnProperty(prop)) {
        method = obj[prop];

        if (method instanceof Function)
          obj[prop] = method.client();
      }
    }
    Client.prototype[name] = obj;
    return Client.prototype[name];
  }
});

/**
 * @expose
 * @param {string} name Service name.
 * @return {Object.<string, function(this:Client)>}
 * @throws {Error|TypeError}
 */
Object.prototype.service;