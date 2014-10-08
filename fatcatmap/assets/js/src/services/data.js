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
goog.require('async.task');
goog.require('async.future');
goog.require('support');
goog.require('service');
goog.require('services.storage');
goog.require('models.data');

goog.provide('services.data');

var _dataCache, _dataBuffer, _dataStore, _watchers, _dataInit;

_dataCache = {};

_dataBuffer = {
  index: {},
  buffer: [],
  id: null
};

if (support.storage.local)
  _dataStore = new Store(window.localStorage, 'data', 'data');

_watchers = {};

models.data.Key.prototype.get = function () {
  return _dataStore.get(this._safe);
};

/**
 * @expose
 */
services.data = /** @lends {ServiceContext.prototype.data} */ {
  /**
   * @expose
   * @param {GraphData} data Raw input.
   * @param {function(GraphData)=} cb
   * @this {ServiceContext}
   */
  init: function (data, cb) {
    data.data.keys = models.data.Key.unpack(data.data.keys, data.meta.kinds);

    _dataCache = util.object.zip(data.data.keys, data.data.objects);

    window['DATA'] = data;
    window['DATACACHE'] = _dataCache;

    if (cb)
      cb(data);
  },

  /**
   * @expose
   * @param {(string|Array.<string>)} key
   * @return {Future}
   * @this {ServiceContext}
   */
  get: function (key) {
    var result, item;

    if (Array.isArray(key)) {
      return this.data.getAll(key);
    } else {
      item = _dataCache[key];
      result = new Future();

      if (item) {
        result.fulfill(item);
      } else {
        // Retrieve from localStorage & server.
      }
      return result;
    }
  },

  /**
   * @expose
   * @param {Array.<string>} keys
   * @return {Future}
   * @this {ServiceContext}
   */
  getAll: function (keys) {
    var result = new Future(),
      items = [],
      shouldErr;

    keys.forEach(function (key, i) {
      services.data.get(key).then(function (data, err) {
        if (err) {
          if (shouldErr) {
            shouldErr = false;
            result.fulfill(false, err);
          }
          return;
        }

        items[i] = data;

        if (items.length === keys.length)
          result.fulfill(items);
      });
    });

    return result;
  },

  /**
   * @expose
   * @param {string} key
   * @param {*} data
   * @this {ServiceContext}
   */
  set: function (key, data) {
    var __watchers = _watchers[key];

    util.object.resolveAndSet(_dataCache, key, data);

    if (__watchers && __watchers.length) {
      __watchers.forEach(function (watcher) {
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
    if (!_watchers[key])
      _watchers[key] = [];

    _watchers[key].push(watcher);
  },

  /**
   * @expose
   * @param {string} key
   * @param {function(*)=} watcher
   * @return {(function(*)|Array.<function(*)>)}
   * @this {ServiceContext}
   */
  unwatch: function (key, watcher) {
    var __watchers = watcher;
    if (watcher && typeof watcher === 'function') {
      _watchers[key] = _watchers[key].filter(function (w) {
        return w === watcher;
      });
    } else {
      __watchers = _watchers[key];
      _watchers[key] = [];
    }
    return __watchers;
  }
}.service('data');
