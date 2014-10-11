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
goog.require('services.rpc');
goog.require('services.storage');
goog.require('models');

goog.provide('services.data');

var _dataCache = {};

/**
 * @expose
 */
services.data = /** @lends {ServiceContext.prototype.data} */ {
  /**
   * @expose
   * @type {?services.storage.Store}
   */
  storage: (
    support.storage.local ?
    new services.storage.Store(window.localStorage, 'data', 'data') :
    null),

  /**
   * @expose
   * @param {GraphData} raw Raw input.
   * @param {function(GraphData)=} cb
   * @this {ServiceContext}
   */
  init: function (raw, cb) {
    var data = this.data;

    raw.data.keys = models.Key.unpack(raw.data.keys, raw.meta.kinds);
    raw.data.keys.forEach(function (key, i) {
      data.receive(key, raw.data.objects[i]);
    });

    if (cb)
      cb(raw);
  },

  /**
   * @expose
   * @param {(string|models.Key)} key
   * @param {DataObject} data
   * @this {ServiceContext}
   * @throws {TypeError} If key is not a string or instance of Key.
   */
  receive: function (key, data) {
    if (typeof key === 'string')
      key = models.Key.unpack(key);

    if (!(key instanceof models.Key))
      throw new TypeError('services.data.receive() expects a string or Key as the first param.');

    _dataCache[key] = data;

    key.bind(data.data);
    key.put();
  },


  /**
   * @expose
   * @param {(string|models.Key)} key
   * @return {Future}
   * @this {ServiceContext}
   * @throws {TypeError} If key is not a string or Key.
   */
  get: function (key) {
    var result = new Future();

    if (typeof key === 'string')
      key = models.Key.unpack(key);

    if (!(key instanceof models.Key))
      throw new TypeError('services.data.get() expects a string key or Key instance.');

    this.rpc.data.fetch({
      /** @type {DataQuery} */
      data: {
        keys: [key.urlsafe()]
      }
    }).then(
      /**
       * @param {(Data|boolean)} data
       * @param {Error=} error
       */
      function (data, error) {
        if (!data && error)
          return result.fulfill(false, error);

        key.bind(data.data);
        result.fulfill(key.data());
      });

    return result;
  },

  /**
   * @expose
   * @param {(Array.<(string|models.Key)>|models.KeyIndexedList)} keys
   * @return {Future}
   * @this {ServiceContext}
   */
  getAll: function (keys) {
    var result = new Future();

    this.rpc.data.fetch({
      /** @type {DataQuery} */
      data: {
        keys: keys
      }
    }).then(
      /**
       * @param {(Data|boolean)} data
       * @param {Error=} error
       */
      function (data, error) {
        if (!data && error)
          return result.fulfill(false, error);

        result.fulfill(data.data);
      });

    return result;
  }
}.service('data');

/**
 * @expose
 * @return {*}
 */
models.Key.prototype.get = function () {
  return this.bind(services.storage.data.get(this)).data();
};

/**
 * @expose
 */
models.Key.prototype.put = function () {
  services.storage.data.put(this, this.data());
};

/**
 * @expose
 * @return {Future}
 */
models.Key.prototype.fetch = function () {
  return services.data.get(this);
};

/**
 * @expose
 * @return {Future}
 */
models.KeyIndexedList.prototype.fetch = function () {
  return services.data.getAll(this);
};
