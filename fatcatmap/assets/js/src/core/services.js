/**
 * @fileoverview Core service injection methods.
 *
 * @author  David Rekow <david@momentum.io>,
 *          Sam Gammon <sam@momentum.io>,
 *          Alex Rosner <alex@momentum.io>,
 *          Ian Weisberger <ian@momentum.io>
 * 
 * copyright (c) momentum labs, 2014
 */

goog.provide('services');

/**
 * Service-injected class.
 * @constructor
 * @param {Object.<string, function(...)>=} methods
 */
var Client = function (methods) {
  if (methods) {
    for (var k in methods) {
      if (methods.hasOwnProperty(k))
        this[k] = methods[k];
    }
  }
};

Client.prototype = services;


Object.defineProperty(Function.prototype, 'client', {
  /**
   * @expose
   * @param {Object.<string, function(...)>=} methods
   * @return {function(...)}
   */
  value: /** @this {Function} */ function (methods) {
    var fn = this;

    return function () {
      return fn.apply(new Client(methods), arguments);
    };
  }
});

/**
 * @expose
 * @param {Object.<string, function(...)>=} methods
 * @return {function(...)}
 */
Function.prototype.client;


Object.defineProperty(Function.prototype, 'service', {
  /**
   * @expose
   * @param {string} name Service name.
   * @param {Object.<string, function(...)>=} methods
   * @return {function(...)}
   */
   value: /** @this {Function} */ function (name, methods) {
    Client.prototype[name] = this.client(methods);
    return Client.prototype[name];
  }
});

/**
 * @expose
 * @param {string} name Service name.
 * @param {Object.<string, function(...)>=} methods
 * @return {function(...)}
 */
Function.prototype.service;


Object.defineProperty(Object.prototype, 'service', {
  /**
   * @expose
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
 * @return {Object.<string, (function(this:Client)|Object.<string, function(this:Client)>)>}
 * @throws {Error|TypeError}
 */
Object.prototype.service;

/**
 * @expose
 * @param {string} name
 * @param {(function(*)|Object.<string, function(*)>)} service
 * @throws {TypeError}
 */
services.service._register = function (name, service) {
  services[name] = service;
};
