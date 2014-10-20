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
goog.require('cache');
goog.require('support');
goog.require('service');
goog.require('services.rpc');
goog.require('services.storage');
goog.require('models');
goog.require('models.data');

goog.provide('services.data');

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
   * @type {?models.KeyIndexedList}
   */
  cache: null,

  /**
   * @expose
   * @type {?string}
   */
  session: null,

  /**
   * @expose
   * @param {GraphData} raw Raw input.
   * @param {function(GraphData)=} cb
   * @this {ServiceContext}
   */
  init: function (raw, cb) {
    var data = this;

    this.cache = new models.KeyIndexedList();

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
   * @param {(DataObject|models.data.KeyedData)} data
   * @this {ServiceContext}
   * @throws {TypeError} If key is not a string or instance of Key.
   */
  receive: function (key, data) {
    if (typeof key === 'string')
      key = models.Key.inflate(key);

    if (!(key instanceof models.Key))
      throw new TypeError('services.data.receive() expects a string or Key as the first param.');

    if (!(data instanceof models.data.KeyedData))
      data = new models.data.KeyedData(key, data.data);

    data.put();
    this.services.data.cache.push(data);

    return data;
  },


  /**
   * @expose
   * @param {(string|models.Key)} key
   * @return {Future}
   * @this {ServiceContext}
   * @throws {TypeError} If key is not a string or Key.
   */
  get: function (key) {
    var data = this,
      result = new Future();

    if (typeof key === 'string')
      key = models.Key.inflate(key);

    if (!(key instanceof models.Key))
      throw new TypeError('services.data.get() expects a string key or Key instance.');

    this.rpc.data.fetch({
      /** @type {DataQuery} */
      data: {
        keys: [key],
        session: this.session,
        options: {
          collections: true
        }
      }
    }).then(function (_data, error) {
      if (!_data && error)
        return result.fulfill(false, error);

      _data = _data.data;

      data.session = _data.session;

      _data.objects.forEach(function (object, i) {
        var k, d;

        if (_data.keys.data[i].encoded) {
          k = models.Key.inflate(_data.keys.data[i].encoded);
          d = data.receive(k, object);

          if (key.equals(k))
            result.fulfill(d);
        }
      });

      if (result.status === 'PENDING')
        result.fulfill(data.cache.get(key.bind({})));
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
