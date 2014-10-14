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

goog.require('async.future');
goog.require('service');
goog.require('services.rpc');

goog.provide('services.template');

var TEMPLATES = {};

/**
 * @expose
 */
services.template = /** @lends {ServiceContext.prototype.template} */ {
  /**
   * @param {string} filename
   * @param {string} source
   * @this {ServiceContext}
   */
  put: function (filename, source) {
    if (typeof filename === 'string' && typeof source === 'string')
      TEMPLATES[filename] = source;
  },

  /**
   * @param {string} filename
   * @return {Future}
   * @throws {TypeError} If filename is not a string.
   * @this {ServiceContext}
   */
  get: function (filename) {
    var template = new Future();

    if (typeof filename !== 'string')
      throw new TypeError('template.get() requires a string filename.');

    if (TEMPLATES[filename]) {
      template.fulfill({
        path: filename,
        source: TEMPLATES[filename]
      });
    } else {
      this.rpc.content.template({
        data: {
          path: filename
        }
      }).then(function (tpl, err) {
        if (err)
          return template.fulfill(false, err);

        template.fulfill(tpl);
      });
    }

    return template;
  },

  /**
   * @param {string} filename
   * @return {boolean}
   * @this {ServiceContext}
   */
  has: function (filename) {
    return !!TEMPLATES[filename];
  },

  /**
   * @param {Object.<string, string>} manifest
   * @this {ServiceContext}
   */
  init: function (manifest) {
    for (var k in manifest) {
      if (manifest.hasOwnProperty(k) && typeof manifest[k] === 'string')
        services.template.put(k, manifest[k]);
    }
  }
}.service('template');
