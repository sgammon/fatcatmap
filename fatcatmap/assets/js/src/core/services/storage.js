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

goog.provide('services.storage');

var StringStore,
  digitMatcher = /^[0-9]+$/,

  /**
   * @param {*} item
   * @return {string}
   */
  serialize = function (item) {
    if (typeof item === 'string')
      return item;

    if (item == null)
      return "";

    if (typeof item === 'object')
      return JSON.stringify(item);

    return String(item);
  },

  /**
   * @param {string} item
   * @return {*}
   */
  deserialize = function (item) {
    var char1 = item.charAt(0);
    if (char1 === '{' || char1 === '[')
      return JSON.parse(item);

    if (!item)
      return item === '' ? item : null;

    if (item === 'true' || item === 'false')
      return Boolean(item);

    if (digitMatcher.test(item))
      return +item;

    return item;
  };

/**
 * @constructor
 * @param {Storage} backend
 */
StringStore = function (backend) {
  /**
   * @param {string} key
   * @return {*}
   */
  this.get = function (key) {
    return deserialize(backend.getItem(key) || '');
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
};

/**
 * @expose
 */
services.storage = {
  /**
   * @type {?StringStore}
   * @expose
   */
  local: supports.storage.local ? new StringStore(window.localStorage) : null,

  /**
   * @expose
   * @type {?StringStore}
   */
  session: supports.storage.session ? new StringStore(window.sessionStorage) : null
};
