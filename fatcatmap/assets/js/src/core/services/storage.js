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

goog.require('support');
goog.require('service');

goog.provide('services.storage');

/**
 * @constructor
 * @param {Storage} backend
 * @param {string=} namespace
 * @param {string=} provideAs
 */
var Store = function (backend, namespace, provideAs) {
  /**
   * @private
   * @type {string}
   */
  this._ns = (namespace || 'store' + Store.storeCount++) + '::';

  /**
   * @private
   * @type {Storage}
   */
  this._backend = backend;

  if (typeof provideAs === 'string') {
    ServiceContext.inject('storage.' + provideAs, this);
    services.storage[provideAs] = this;
  }

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
    var char1;

    if (!item)
      return item === '' ? item : null;

    char1 = item.charAt(0);
    if (char1 === '{' || char1 === '[')
      return JSON.parse(item);

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
    return this.deserialize(this._backend.getItem(this._ns + key));
  },

  /**
   * @param {string} key
   * @param {*} value
   */
  put: function (key, value) {
    this._backend.setItem(this._ns + key, this.serialize(value));
  },

  /**
   * @param {string} key
   */
  del: function (key) {
    this._backend.removeItem(this._ns + key);
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
services.storage = /** @lends {ServiceContext.prototype.storage} */{
  /**
   * @expose
   * @constructor
   * @param {Storage} backend
   * @param {string=} namespace
   * @param {string=} provideAs
   */
  Store: Store
};

if (support.storage.local) {
  /**
   * @expose
   * @type {?Store}
   */
  services.storage.local = new Store(window.localStorage, 'local', 'local');
}

if (support.storage.session) {
  /**
   * @expose
   * @type {?Store}
   */
  services.storage.session = new Store(window.sessionStorage, 'session', 'session');
}
