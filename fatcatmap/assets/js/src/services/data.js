/**
 * @fileoverview Fatcatmap data retrieval & normalization service.
 *
 * @author  David Rekow <david@momentum.io>,
 *          Sam Gammon <sam@momentum.io>,
 *          Alex Rosner <alex@momentum.io>,
 *          Ian Weisberger <ian@momentum.io>
 * 
 * copyright (c) momentum labs, 2014
 */

goog.require('services');

goog.provide('services.data');

var Diff, DIFF;

/**
 * @constructor
 */
Diff = function () {
  /**
   * @type {Object.<string, Object>}
   */
  this._diff = {};
};

/**
 * @param {string} key
 * @param {Object} diff
 * @throws {Error} If called after diff was committed.
 */
Diff.prototype.add = function (key, diff) {
  var k, obj;
  if (!this._diff[key]) {
    this._diff[key] = diff;
    return;
  }

  obj = this._diff[key];

  for (k in diff) {
    if (diff.hasOwnProperty(k)) {
      obj[k] = diff[k];
    }
  }

  this._diff[key] = obj;
};

/**
 * @return {Object.<string, Object>}
 */
Diff.prototype.commit = function () {
  var diff = this._diff;

  this._diff = false;

  this.add = function () {
    throw new Error('Cannot add to committed diff.');
  };

  return diff;
};


/**
 * @expose
 */
services.data = /** @lends {Client.prototype.data} */ {
  /**
   * @expose
   * @param {string|Object} raw Raw input.
   * @this {Client}
   */
  init: function (raw) {
    DIFF = new Diff();
    /**
     * @type {Object.<string, Array.<function(Object)>>}
     */
    this._watchers = {};
  },

  /**
   * @expose
   * @param {string|Object} raw Raw input.
   * @return {Object} Normalized data.
   */
  normalize: function (raw) {
    if (typeof raw === 'string') {
      try {
        raw = JSON.parse(raw);
      } catch (e) {
        raw = {};
      }
    }
    return raw;
  },

  /**
   * @expose
   * @param {string} key
   * @param {(Object|function(Object))} target
   * @param {function(Object)=} fn
   * @this {Client}
   * @throws {Error} If watcher function or key is not passed.
   */
  watch: function (key, target, fn) {
    if (!key)
      throw new Error('services.data.watch() requires a string key.');

    if (!fn) {
      if (typeof target !== 'function')
        throw new Error('services.data.watch() requires a watcher function.');

      fn = target;
      target = null;
    }

    if (!this._watchers[key])
      this._watchers[key] = [];

    this._watchers[key].push(target ? fn.bind(target) : function (obj) {
      fn.call(obj, obj);
    });
  },

  /**
   * @expose
   * @param {string} key
   * @param {function(Object)=} fn
   * @this {Client}
   */
  unwatch: function (key, fn) {
    var watchers, i;
    if (this._watchers[key]) {
      watchers = this._watchers[key];

      if (fn) {
        for (i = 0; i < watchers.length; i++) {
          if (fn === watchers[i]) {
            watchers.splice(i, 1);
            break;
          }
        }
      } else {
        watchers = [];
      }

      this._watchers[key] = watchers;
    }
  }
}.service('data');