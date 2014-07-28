/**
 * @fileoverview Fatcatmap template service.
 *
 * @author  David Rekow <david@momentum.io>,
 *          Sam Gammon <sam@momentum.io>,
 *          Alex Rosner <alex@momentum.io>,
 *          Ian Weisberger <ian@momentum.io>
 * 
 * copyright (c) momentum labs, 2014
 * @todo batched requests
 */

goog.require('async');
goog.require('services');
goog.require('services.rpc');

goog.provide('services.template');

var TEMPLATES = {};

/**
 * @expose
 */
services.template = /** @lends {Client.prototype.template} */ {
  /**
   * @expose
   * @param {string} filename
   * @param {string} source
   * @this {Client}
   */
  put: function (filename, source) {
    if (typeof filename === 'string' && typeof source === 'string')
      TEMPLATES[filename] = source;
  },

  /**
   * @expose
   * @param {string} filename
   * @param {CallbackMap} callbacks
   * @throws {TypeError} If either param is missing.
   * @this {Client}
   */
  get: function (filename, callbacks) {
    if (!(typeof filename === 'string' &&
          typeof callbacks.success === 'function' &&
          typeof callbacks.error === 'function'))
      throw new TypeError('template.get() requires a filename and CallbackMap.');

    if (TEMPLATES[filename])
      return callbacks.success({ data: TEMPLATES[filename] });

    return this.rpc.content.template({
      data: { path: filename }
    }, callbacks);
  },

  /**
   * @expose
   * @param {Object.<string, string>} manifest
   * @this {Client}
   */
  init: function (manifest) {
    for (var k in manifest) {
      if (manifest.hasOwnProperty(k) && typeof manifest[k] === 'string')
        services.template.put(k, manifest[k]);
    }
  }
}.service('template');
