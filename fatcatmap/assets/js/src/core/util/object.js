/**
 * @fileoverview Object utility methods.
 *
 * @author  David Rekow <david@momentum.io>,
 *          Sam Gammon <sam@momentum.io>,
 *          Alex Rosner <alex@momentum.io>,
 *          Ian Weisberger <ian@momentum.io>
 * 
 * copyright (c) momentum labs, 2014
 */

goog.provide('util.object');

util.object = {
  /**
   * @param {*} obj
   * @return {boolean}
   */
  isObject: function (obj) {
    return (/Object/).test(Object.prototype.toString.call(obj));
  },

  /**
   * Resolves a nested key (<code>.</code> delimited).
   * @param {Object.<string, *>} obj
   * @param {string} key
   * @return {*}
   */
  resolve: function (obj, key) {
    var keys = key.split('.');
    while (keys.length > 1) {
      obj = obj[keys.shift()];
      if (!util.object.isObject(obj))
        return obj;
    }
    return obj[keys.shift()];
  },

  /**
   * Resolves and sets a nested key (<code>.</code> delimited). Think <code>mkdir -p</code>.
   * @param {Object.<string, *>} obj
   * @param {string} key
   * @param {*} data
   */
  resolveAndSet: function (obj, key, data) {
    var keys = key.split('.');
    while (keys.length > 1) {
      key = keys.shift();

      if (!obj[key])
        obj[key] = {};

      obj = obj[key];
    }
    obj[keys.shift()] = data;
  }
};