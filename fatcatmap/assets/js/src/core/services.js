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
 * @return {function(this:Client)}
 */
Function.prototype.client = function () {
  var fn = this;

  return /** @this {Client} */function () {
    return fn.apply(new Client(), arguments);
  };
};


/**
 * @param {string} name Service name.
 * @return {function(this:Client)}
 */
Function.prototype.service = function (name) {
  Client.prototype[name] = this.client();
  return Client.prototype[name];
};


Object.defineProperty(Object.prototype, 'service', {
  /**
   * @expose
   * @param {string} name Service name.
   * @return {Object.<string, function(this:Client)>}
   * @throws {Error|TypeError}
   */
  value: function (name) {
    var method;
    if (!name || typeof name !== 'string') {
      throw new TypeError('service() requires a string name.');
    }
    if (this.constructor !== Object) {
      throw new Error('service() can only be invoked on native objects.');
    }
    for (var prop in this) {
      if (this.hasOwnProperty(prop)) {
        method = this[prop];
        if (method instanceof Function) {
          this[prop] = method.client();
        }
      }
    }
    Client.prototype[name] = this;
    return Client.prototype[name];
  }
});