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
goog.require('services');

goog.provide('services.storage');

var StringStore, _serialize, _deserialize;

/**
 * @param {*} item
 * @return {string}
 */
_serialize = function (item) {
  if (typeof item === 'string')
    return item;

  if (item == null)
    return "";

  if (typeof item === 'object')
    return JSON.stringify(item);

  return String(item);
};

/**
 * @param {string} item
 * @return {*}
 */
_deserialize = function (item) {
  var char1 = item.charAt(0);
  if (char1 === '{' || char1 === '[')
    return JSON.parse(item);

  if (!item)
    return item === '' ? item : null;

  if (item === 'true' || item === 'false')
    return Boolean(item);

  if (/^[0-9]+$/.test(item))
    return +item;

  return item;
};

/**
 * @constructor
 * @param {Storage} backend
 * @param {string=} namespace
 */
StringStore = function (backend, namespace) {
  /**
   * @type {string}
   */
  this.ns = namespace || 'stringstore' + this.constructor.storeCount++;
  /**
   * @param {string} key
   * @return {*}
   */
  this.get = function (key) {
    return _deserialize(backend.getItem(this.ns + '::' + key));
  };

  /**
   * @param {string} key
   * @param {*} value
   */
  this.put = function (key, value) {
    backend.setItem(this.ns + '::' + key, _serialize(value));
  };

  /**
   * @param {string} key
   */
  this.del = function (key) {
    backend.removeItem(this.ns + '::' + key);
  };
};

/**
 * @static
 * @type {number}
 */
StringStore.storeCount = 0;


/**
 * @expose
 */
services.storage = /** @lends {ServiceContext.prototype.storage} */{};

if (supports.storage.local) {
  /**
   * @expose
   * @type {?StringStore}
   */
  services.storage.local = new StringStore(window.localStorage, 'service');
}

if (supports.storage.session) {
  /**
   * @expose
   * @type {?StringStore}
   */
  services.storage.session = new StringStore(window.sessionStorage, 'service');
}
