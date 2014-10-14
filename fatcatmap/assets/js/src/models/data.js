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

Object.defineProperty(KeyedData.prototype, 'parent', {
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
    return this.key.parent ? this.key.parent.data() : null;
  }
});

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
