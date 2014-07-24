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

goog.require('service.sse');
goog.require('service.http');
goog.require('service.socket');
goog.require('service.storage');

goog.provide('service');

/**
 * @constructor
 */
var Client = function () {};

Client.prototype = service;

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