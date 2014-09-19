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

goog.require('util.object');
goog.require('supports');
goog.require('services');
goog.require('services.storage');

goog.provide('services.data');

var _dataCache, _dataStore, watchers;

_dataCache = {};

if (supports.storage.local)
  _dataStore = new Store(window.localStorage, 'data', 'storage.data');

watchers = {};

/**
 * @expose
 */
services.data = /** @lends {ServiceContext.prototype.data} */ {
  /**
   * @expose
   * @param {string|Object} raw Raw input.
   * @param {function((string|Object))} cb
   * @this {ServiceContext}
   */
  init: function (raw, cb) {
    var data = this.data.normalize(raw),
      keys = data.data.keys,
      objects = data.data.objects,
      key, object, i;

    for (i = 0; keys && i < keys.length; i++) {
      key = keys[i];
      object = objects[i];

      if (!object.key)
        object.key = key;

      if (!object.native) {
        object.kind = object.govtrack_id ? 'legislator' : 'contributor';
      }

      _dataCache[key] = object;
    }

    cb(data);
  },

  /**
   * @expose
   * @param {string|Object|*} raw Raw input.
   * @return {Object|*} Normalized data.
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
   * @param {(string|Array.<string>)} key
   * @param {CallbackMap} cbs
   * @this {ServiceContext}
   */
  get: function (key, cbs) {
    var item, nativeKey;

    if (Array.isArray(key)) {
      return this.data.getAll(key, cbs);
    } else {
      item = _dataCache[key];

      if (item) {
        nativeKey = item.native;
        if (nativeKey && typeof nativeKey === 'string') {

          if (_dataCache[nativeKey]) {
            _dataCache[nativeKey].node_key = key;
            this.data.set(key + '.native', _dataCache[nativeKey]);
          } else {
            this.data.get(nativeKey, /** @type {CallbackMap} */({
              success: function (data) {
                data.node_key = key;
                services.data.set(key + '.native', data);
                services.data.set(nativeKey, data);
              },

              error: function (e) {}
            }));
          }
        }

        return cbs.success(item);
      } else {
        // Retrieve from localStorage & server.
      }
    }
  },

  /**
   * @expose
   * @param {Array.<string>} keys
   * @param {CallbackMap} cbs
   * @this {ServiceContext}
   */
  getAll: function (keys, cbs) {
    var items = [],
      shouldErr = true;

    keys.forEach(function (key, i) {
      services.data.get(key, /** @type {CallbackMap} */({
        success: function (data) {
          items[i] = data;

          if (items.length === keys.length)
            cbs.success(items);
        },

        error: function (e) {
          if (shouldErr) {
            shouldErr = false;
            cbs.error(e);
          }
        }
      }));
    });
  },

  /**
   * @expose
   * @param {string} key
   * @param {*} data
   * @this {ServiceContext}
   */
  set: function (key, data) {
    var _watchers = watchers[key];

    util.object.resolveAndSet(_dataCache, key, data);

    if (_watchers && _watchers.length) {
      _watchers.forEach(function (watcher) {
        watcher(data);
      });
    }
  },

  /**
   * @expose
   * @param {string} key
   * @param {function(*)} watcher
   * @this {ServiceContext}
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
   * @this {ServiceContext}
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
