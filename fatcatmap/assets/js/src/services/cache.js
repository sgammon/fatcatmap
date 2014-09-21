/**
 * @fileoverview Fatcatmap caching service.
 *
 * @author  David Rekow <david@momentum.io>,
 *          Sam Gammon <sam@momentum.io>,
 *          Alex Rosner <alex@momentum.io>,
 *          Ian Weisberger <ian@momentum.io>
 * 
 * copyright (c) momentum labs, 2014
 */

goog.require('async.decorators');
goog.require('services');

goog.provide('services.cache');

var Cache, LRUCache;

/**
 * @constructor
 */
Cache = function () {
  this.digest = this.digest.bind(this).debounce(50);

  /**
   * @protected
   * @type {Object.<string, *>}
   */
  this._cache = {};

  /**
   * @protected
   * @type {Array.<Object>}
   */
  this._expires = [];
};

/**
 * @expose
 * @param {string} key
 * @return {*}
 */
Cache.prototype.get = function (key) {
  return this._cache[key];
};

/**
 * @expose
 * @param {string} key
 * @param {*} data
 * @param {number=} expiry
 */
Cache.prototype.set = function (key, data, expiry) {
  var i = null,
    lo, mid, hi;

  this._cache[key] = data;

  if (expiry && typeof expiry === 'number') {
    expiry = expiry > 1e12 ? expiry : Date.now() + expiry;
    lo = 0;
    hi = this._expires.length;

    while (lo < hi) {
      mid = Math.floor((lo + hi) / 2);
      if (this._expires[mid].timestamp > expiry) {
        hi = mid
      } else {
        lo = mid + 1;
      }
    }

    this._expires.splice(lo, 0, {
      timestamp: expiry,
      key: key
    });
  }

  this.digest();
};

/**
 * @expose
 * @param {string} key
 */
Cache.prototype.del = function (key) {
  this._cache[key] = null;
};

/**
 * @expose
 * @param {string} key
 * @return {boolean}
 */
Cache.prototype.has = function (key) {
  return this._cache[key] !== null;
};

/**
 * @protected
 */
Cache.prototype.digest = function () {
  var _expires = this._expires,
    expires = [],
    now = Date.now(),
    i, item;

  for (i = 0; i < _expires.length; i++) {
    item = _expires[i];

    if (item.timestamp < now) {
      this._cache[item.key] = null;
    } else {
      expires.push(item);
    }
  }

  this._expires = expires;
};

/**
 * @expose
 */
services.cache = new Cache().service('cache');
