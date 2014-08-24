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

goog.require('async');
goog.require('services');

goog.provide('services.data');

var _dataCache, watchers, _resolveAndSet;

_dataCache = {};

watchers = {};

/**
 * @private
 * @param {string} key
 * @param {Object} data
 */
_resolveAndSet = function (key, data) {
  var keys = key.split('.'),
    obj = _dataCache;
  while (keys.length > 1) {
    obj = obj[keys.shift()] || {};
  }
  obj[keys.shift()] = data;
};

/**
 * @expose
 */
services.data = /** @lends {Client.prototype.data} */ {
  /**
   * @expose
   * @param {string|Object} raw Raw input.
   * @param {function(string|Object)} cb
   * @this {Client}
   */
  init: function (raw, cb) {
    var data = this.data.normalize(raw),
      keys = data.data.keys,
      objects = data.data.objects,
      i;
    for (i = 0; keys && i < keys.length; i++) {
      _dataCache[keys[i]] = objects[i];
    }
    cb(data);
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
        console.warn('[service.data] Couldn\'t parse raw data: ');
        console.warn(raw);
        raw = {};
      }
    }
    return raw;
  },

  /**
   * @expose
   * @param {string} key
   * @param {CallbackMap} cbs
   */
  get: function (key, cbs) {
    var item = _dataCache[key],
      _cbs = {
        success: function (data) {
          this.data.set(nativeKey, data);
          cbs.success(data);
        }.bind(this),

        error: cbs.error
      },
      nativeKey;
    if (item) {
      if (item.native && typeof item.native === 'string') {
        nativeKey = item.native;

        this.watch(nativeKey, function (data) {
          this.data.set(key + '.native', data);
        }.bind(this));

        return this.data.get(nativeKey, _cbs);
      }
      return cbs.success(item);
    } else {
      // Retrieve from server.
      debugger;
    }
  },

  /**
   * @expose
   * @param {string} key
   * @param {*} data
   */
  set: function (key, data) {
    _resolveAndSet(key, data);

    if (watchers[key].length) {
      watchers[key].forEach(function (watcher) {
        watcher(data);
      });
    }
  },

  /**
   * @expose
   * @param {string} key
   * @param {function(*)} watcher
   */
  watch: function (key, watcher) {
    if (!watchers[key])
      watchers[key] = [];

    watchers[key].push(watcher);
  },

  /**
   * @expose
   * @param {string} key
   * @param {function(*)=} watcher
   * @return {(function(*)|Array.<function(*)>)}
   */
  unwatch: function (key, watcher) {
    var _watchers = watcher;
    if (watcher && typeof watcher === 'function') {
      watchers[key] = watchers[key].filter(function (w) {
        return w === watcher;
      });
    } else {
      _watchers = watchers[key];
      watchers[key] = [];
    }
    return _watchers;
  }
}.service('data');