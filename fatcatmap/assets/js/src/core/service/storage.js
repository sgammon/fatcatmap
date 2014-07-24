/**
 * @fileoverview localStorage and sessionStorage service adapters.
 *
 * @author  David Rekow <david@momentum.io>,
 *          Sam Gammon <sam@momentum.io>,
 *          Alex Rosner <alex@momentum.io>,
 *          Ian Weisberger <ian@momentum.io>
 * 
 * copyright (c) momentum labs, 2014
 */

goog.require('supports');

goog.provide('service.storage');

var StringStore;

/**
 * @constructor
 * @param {Storage} backend
 * @throws {TypeError} If incorrect backend type provided.
 */
StringStore = (function () {
  var digitMatcher = /^[0-9]+$/,
    serialize, deserialize;

  /**
   * @param {*} item
   * @return {string}
   */
  serialize = function (item) {
    if (typeof item === 'string') {
      return item;
    }
    if (item == null) {
      return "";
    }
    if (typeof item === 'object') {
      return JSON.stringify(item);
    }
    return String(item);
  };

  /**
   * @param {string} item
   * @return {?(Object|Array|number|boolean|string)}
   */
  deserialize = function (item) {
    var char1 = item.charAt(0);
    if (char1 === '{' || char1 === '[') {
      return JSON.parse(item);
    }
    if (!item) {
      return null;
    }
    if (item === 'true' || item === 'false') {
      return Boolean(item);
    }
    if (digitMatcher.test(item)) {
      return +item;
    }
    return item;
  };
  /**
   * @constructs {StringStore}
   * @param {Storage} backend
   */
  function StringStore (backend) {
    /**
     * @param {string} key
     * @return {?(Object|Array|number|boolean|string)}
     */
    this.get = function (key) {
      return deserialize(backend.getItem(key));
    };

    /**
     * @param {string} key
     * @param {*} value
     */
    this.put = function (key, value) {
      backend.setItem(key, serialize(value));
    };

    /**
     * @param {string} key
     */
    this.del = function (key) {
      backend.removeItem(key);
    };
  }

  return StringStore;

})();

/**
 * @type {?StringStore}
 */
service.storage.local = supports.storage.local ? new StringStore(window.localStorage) : null;

/**
 * @type {?StringStore}
 */
service.storage.session = supports.storage.session ? new StringStore(window.sessionStorage) : null;
