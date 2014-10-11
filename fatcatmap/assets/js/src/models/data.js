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

var Entity;

/**
 * Represents a contextual data object.
 * @extends {models.KeyedItem}
 * @constructor
 * @param {!(string|models.Key)} key
 * @param {Object=} data
 */
Entity = function (key, data) {
  models.KeyedItem.call(this, key);

  if (data)
    this.key.bind(data);
};

util.object.inherit(Entity, models.KeyedItem);

util.object.mixin(Entity, /** @lends {Entity.prototype} */{
  /**
   * Persists the current Entity into the default Key store.
   * @return {Entity}
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
Entity.prototype.data;

Object.defineProperty(Entity.prototype, 'data', {
  /**
   * @expose
   * @type {boolean}
   */
  enumerable: true,

  /**
   * @expose
   * @return {*}
   * @this {Entity}
   */
  get: function () {
    return this.key.data()
  },

  /**
   * @expose
   * @param {*} data
   * @this {Entity}
   */
  set: function (data) {
    this.key.bind(data);
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
  Entity: Entity
};
