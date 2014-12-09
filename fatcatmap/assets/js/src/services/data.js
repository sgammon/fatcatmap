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
goog.require('model');
goog.require('service');
goog.require('services.rpc');
goog.require('services.storage');

goog.provide('services.data');

/**
 * @expose
 * @type {(Array.<(string|model.Key)>|model.KeyList.<model.Key>)}
 */
GraphData.data.keys;


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
   * @type {?model.KeyIndexedList.<model.Model>}
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
    var received;

    this.cache = new model.KeyIndexedList();

    raw.data.keys = model.Key.unpack(raw.data.keys, raw.meta.kinds);

    raw.data = this.receiveAll(raw.data);

    if (cb)
      cb(raw);
  },

  /**
   * @expose
   * @param {(string|model.Key)} key
   * @param {(DataObject|model.Model)} data
   * @this {ServiceContext}
   * @throws {TypeError} If key is not a string or instance of Key.
   */
  receive: function (key, data) {
    if (typeof key === 'string')
      key = model.Key.inflate(key);

    if (!(key instanceof model.Key))
      throw new TypeError('services.data.receive() expects a string or Key as the first param.');

    data = key.bind(data);
    data.put();

    this.cache.push(data);

    return data;
  },

  /**
   * @expose
   * @param {GraphData#data} rawdata
   * @this {ServiceContext}
   * @throws {TypeError} If any keys are not strings or instances of Key.
   */
  receiveAll: function (rawdata) {
    var data = this,
      objects = rawdata.objects;

    rawdata.keys.forEach(function (key, i) {
      rawdata.objects[i] = data.receive(key, rawdata.objects[i]);
    });

    return rawdata;
  },

  /**
   * @expose
   * @param {(string|model.Key)} key
   * @return {Future}
   * @this {ServiceContext}
   * @throws {TypeError} If key is not a string or Key.
   */
  get: function (key) {
    var data = this,
      result = new Future(),
      /**
       * @param {Data=} d
       */
      handleResponse = function (d) {
        data.session = d.session;

        d.objects.forEach(function (object, i) {
          if (d.keys.data[i].encoded)
            data.receive(model.Key.inflate(d.keys.data[i].encoded), object);
        });
      },
      request = /** @type {Request} */{
        /** @type {DataQuery} */
        data: {
          keys: [key],
          session: this.session,
          options: {
            collections: true
          }
        }
      },
      local;

    if (typeof key !== 'string') {
      if (!(key instanceof model.Key))
        throw new TypeError('services.data.get() expects a string key or Key instance.');

      key = String(key);
    }

    local = this.cache.get(key)

    if (local) {
      result.fulfill(local);

      (function () {
        data.rpc.data.fetch(request).then(function (_data, error) {
          if (_data)
            handleResponse(_data.data);
        });
      }).async();
    } else {
      this.rpc.data.fetch(request).then(function (_data, error) {
        if (!_data && error)
          return result.fulfill(false, error);

        handleResponse(_data.data);

        result.fulfill(data.cache.get(key));
      });
    }

    return result;
  },

  /**
   * @expose
   * @param {(Array.<(string|model.Key)>|model.KeyIndexedList<(string|model.Key)>)} keys
   * @return {Future}
   * @this {ServiceContext}
   */
  getAll: function (keys) {
    var data = this,
      result = new Future(),
      /**
       * @param {Data=} d
       */
      handleResponse = function (d) {
        data.session = d.session;

        d.objects.forEach(function (object, i) {
          if (d.keys.data[i].encoded)
            data.receive(model.Key.inflate(d.keys.data[i].encoded), object);
        });
      };

    this.rpc.data.fetch({
      /** @type {DataQuery} */
      data: {
        keys: keys.filter(function (key) { return data.cache.has(key); })
      }
    }).then(
      /**
       * @param {Data=} _data
       * @param {Error=} error
       */
      function (_data, error) {
        if (!_data && error)
          return result.fulfill(false, error);

        handleResponse(_data.data);

        result.fulfill(keys.map(function (key) { return data.cache.get(key); }));
      });

    return result;
  }
}.service('data');

/**
 * @expose
 * @return {*}
 */
model.Key.prototype.get = function () {
  return services.data.receive(this, this.bind(services.storage.data.get(this)));
};

/**
 * @expose
 */
model.Key.prototype.put = function () {
  services.storage.data.put(this, this.data());
};

/**
 * @expose
 * @return {Future}
 */
model.Key.prototype.fetch = function () {
  return services.data.get(this);
};

/**
 * @expose
 * @return {Future}
 */
model.KeyIndexedList.prototype.fetch = function () {
  return services.data.getAll(this);
};
