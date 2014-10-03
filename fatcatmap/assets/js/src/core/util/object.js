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

goog.require('type');

goog.provide('util.object');

util.object = {
  /**
   * @param {*} obj
   * @return {boolean}
   */
  isObject: function (obj) {
    return type(obj) === 'object';
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
      if (type(obj) !== 'object')
        return null;
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
  },

  /**
   * Returns a data-safe copy of a passed object.
   * @param {?Object} obj
   * @return {?Object}
   */
  copy: function (obj) {
    var _type = type(obj),
      copy, shouldCopy, k, v;

    if (!obj || ['boolean', 'string', 'number'].indexOf(_type) > -1)
      return obj;

    if (_type === 'array')
      return obj.map(function (item) {
        _type = type(item);
        shouldCopy = _type === 'array' || _type === 'object';
        return shouldCopy ? util.object.copy(item) : item;
      });

    copy = {};

    for (k in obj) {
      v = obj[k];
      _type = type(v);
      shouldCopy = _type === 'array' || _type === 'object';

      copy[k] = shouldCopy ? util.object.copy(v) : v;
    }

    return copy;
  },

  /**
   * Shallowly extends a source object's properties onto a target object.
   * @param {?Object} target Object to copy onto.
   * @param {?Object} source Object to copy from.
   * @param {boolean=} safe If true, pass values through <code>util.object.copy</code> before
   *    setting on <code>target</code>.
   * @return {Object}
   */
  extend: function (target, source, safe) {
    var k, v;

    target = target || {};
    source = source || {};

    safe = safe === true ? function (x) {
      return util.object.copy(x);
    } : function (x) {
      return x;
    };

    for (k in source) {
      target[k] = safe(source[k]);
    }

    return target;
  },

  /**
   * Prototypal inheritance.
   * @param {function(...[*])} child
   * @param {function(...[*])} parent
   */
  inherit: function (child, parent) {
    child.prototype = Object.create(parent.prototype);
    child.prototype.constructor = child;

    return child;
  }
};