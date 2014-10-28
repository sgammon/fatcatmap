/**
 * @fileoverview Fatcatmap data models.
 *
 * @author  David Rekow <david@momentum.io>,
 *          Sam Gammon <sam@momentum.io>,
 *          Alex Rosner <alex@momentum.io>,
 *          Ian Weisberger <ian@momentum.io>
 *
 * copyright (c) momentum labs, 2014
 */

goog.require('util.object');
goog.require('models');

goog.provide('models.data');

var KeyedData;

util.object.mixin(models.Key, {
  /**
   * Binds a key to a data item.
   * @expose
   * @param {*} data
   * @return {models.Key}
   * @throws {Error} If data is keyed and key doesn't match current Key.
   */
  bind: function (data) {
    /*jshint eqnull:true */
    var key = this;

    if (data != null) {

      if (data.key && !this.equals(data.key))
        throw new Error('Can\'t bind() data to a mismatched key: ' + this);

      if (data['super'] && typeof data['super'] === 'string') {
        data['super'] = Key.inflate(data['super']);
      }

      if (!data.hasOwnProperty('parent'))
        Object.defineProperty(data, 'parent', {
          /**
           * @expose
           * @type {boolean}
           */
          enumerable: true,

          /**
           * @expose
           * @return {*}
           * @this {KeyedData}
           */
          get: function () {
            return key.parent ? key.parent.data() : null;
          }
        });
    }

    /**
     * @private
     * @type {*}
     */
    this.__data__ = data;

    return this;
  },

  /**
   * Returns any bound data.
   * @expose
   * @return {*}
   */
  data: function () {
    return this.__data__;
  }
});

/**
 * Represents a contextual data object.
 * @extends {models.KeyedItem}
 * @constructor
 * @param {!(string|models.Key)} key
 * @param {Object=} data
 */
KeyedData = function (key, data) {
  models.KeyedItem.call(this, key);

  if (data)
    this.key.bind(data);
};

util.object.inherit(KeyedData, models.KeyedItem);

util.object.mixin(KeyedData, /** @lends {KeyedData.prototype} */{
  /**
   * Persists the current KeyedData into the default Key store.
   * @return {KeyedData}
   */
  put: function () {
    this.key.put();
    return this.key.data();
  }
});


/**
 * @expose
 * @type {?Object}
 */
KeyedData.prototype.data;

Object.defineProperty(KeyedData.prototype, 'data', {
  /**
   * @expose
   * @type {boolean}
   */
  enumerable: true,

  /**
   * @expose
   * @return {*}
   * @this {KeyedData}
   */
  get: function () {
    return this.key.data()
  },

  /**
   * @expose
   * @param {*} data
   * @this {KeyedData}
   */
  set: function (data) {
    this.key.bind(data);
  }
});

/**
 * @expose
 * @type {?KeyedData}
 */
KeyedData.prototype.parent;


/**
 * @expose
 */
models.data = {
  /**
   * @constructor
   * @param {!(string|models.Key)} key
   * @param {Object=} data
   */
  KeyedData: KeyedData
};
