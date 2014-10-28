/**
 * @fileoverview Core caching.
 *
 * @author  David Rekow <david@momentum.io>,
 *          Sam Gammon <sam@momentum.io>,
 *          Alex Rosner <alex@momentum.io>,
 *          Ian Weisberger <ian@momentum.io>
 *
 * copyright (c) momentum labs, 2014
 */

goog.require('util.struct');
goog.require('util.object');

goog.provide('cache');

var LRUCache;

/**
 * @constructor
 * @param {number=} limit
 */
LRUCache = function (limit) {
  if (typeof limit !== 'number')
    limit = 50;

  /**
   * @protected
   * @type {number}
   */
  this._limit = limit;

  /**
   * @protected
   * @type {Object.<string, *>}
   */
  this._items = {};

  /**
   * @protected
   * @type {util.struct.BiLinkedList}
   */
  this._order = new util.struct.BiLinkedList(null, limit);
};

util.object.mixin(LRUCache, /** @lends {LRUCache.prototype} */{
  /**
   * Puts an item in the cache at a string key.
   * @param {string} key
   * @param {*} item
   */
  set: function (key, item) {
    if (this._items[key])
      this._items[key].remove();

    this._order.lpush(item);

    this._items[key] = this._order.head;
  },

  /**
   * Retrieves an item by key from the cache.
   * @param {string} key
   * @return {*}
   * @throws {TypeError} If key is not a string.
   */
  get: function (key) {
    var item;

    if (typeof key !== 'string')
      throw new TypeError('LRUCache.get() expects a string key.');

    item = this._items[key];

    if (item) {
      item = item.remove();
      this._order.lpush(item);
    }

    return item;
  },

  /**
   * Deletes a key from the cache.
   * @param {string} key
   * @throws {TypeError} If key is not a string.
   */
  del: function (key) {
    if (typeof key !== 'string')
      throw new TypeError('LRUCache.del() expects a string key.');

    if (this._items[key]) {
      this._items[key].remove();
      this._items[key] = undefined;
    }
  },

  /**
   * Checks if the cache contains a key.
   * @param {string} key
   * @return {boolean}
   */
  has: function (key) {
    return this._items[key] !== undefined;
  }
});

cache = {
  /**
   * @expose
   * @constructor
   * @param {number=} limit
   */
  LRUCache: LRUCache
};
