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

/**
 * @constructor
 * @param {Storage} backend
 * @param {string=} namespace
 * @param {string=} provideAs
 */
var Store = function (backend, namespace, provideAs) {
  /**
   * @type {string}
   */
  this.ns = (namespace || 'store' + Store.storeCount++) + '::';

  /**
   * @type {Storage}
   */
  this._backend = backend;

  if (typeof provideAs === 'string')
    ServiceContext.register('storage.' + provideAs, this);
};

Store.prototype = {
  /**
   * @param {*} item
   * @return {string}
   */
  serialize: function (item) {
    /*jshint eqnull:true */
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
  deserialize: function (item) {
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
  },

  /**
   * @param {string} key
   * @return {*}
   */
  get: function (key) {
    return this.deserialize(this._backend.getItem(this.ns + key));
  },

  /**
   * @param {string} key
   * @param {*} value
   */
  put: function (key, value) {
    this._backend.setItem(this.ns + key, this.serialize(value));
  },

  /**
   * @param {string} key
   */
  del: function (key) {
    this._backend.removeItem(this.ns + key);
  }
};

/**
 * @static
 * @type {number}
 */
Store.storeCount = 0;


/**
 * @expose
 */
services.storage = /** @lends {ServiceContext.prototype.storage} */{};

if (supports.storage.local) {
  /**
   * @expose
   * @type {?Store}
   */
  services.storage.local = new Store(window.localStorage, 'service', 'storage.local');
}

if (supports.storage.session) {
  /**
   * @expose
   * @type {?Store}
   */
  services.storage.session = new Store(window.sessionStorage, 'service', 'storage.session');
}
