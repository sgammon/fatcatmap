/**
 * @fileoverview Search service.
 *
 * @author  David Rekow <david@momentum.io>,
 *          Sam Gammon <sam@momentum.io>,
 *          Alex Rosner <alex@momentum.io>,
 *          Ian Weisberger <ian@momentum.io>
 * 
 * copyright (c) momentum labs, 2014
 */

goog.require('async.future');
goog.require('services');

goog.provide('services.search');

/**
 * @typedef {Object}
 */
var QueryFilterSpec;

var QuerySpec, Query;

/**
 * @constructor
 * @param {Query} query
 */
QuerySpec = function (query) {
  var joined = [];

  /**
   * @expose
   * @param {QueryFilterSpec} spec
   * @return {QuerySpec}
   */
  this.filter = function (spec) {
    if (spec)
      query.filters.push(spec);

    return this;
  };

  /**
   * @expose
   * @param {number} limit
   * @return {QuerySpec}
   */
  this.limit = function (limit) {
    if (limit)
      /** @expose */
      query.spec.limit = limit;

    return this;
  };

  /**
   * @expose
   * @param {(Query|QueryFilterSpec)} query
   * @return {QuerySpec}
   */
  this.join = function (query) {
    if (!(query instanceof QuerySpec))
      query = new Query(query);

    joined.push(query);

    return this;
  };

  /**
   * @expose
   * @return {Future}
   */
  this.execute = function () {
    var results;

    if (joined.length === 0)
      return query.execute();

    results = new MultiFuture(joined.map(function (query) {
      return query.execute();
    })).then(function (joined, error) {
      if (error)
        return results.fulfill(false, error);

      query.execute().then(function (_results, error) {
        if (error)
          return results.fulfill(false, error);

        joined.push(_results);

        results.fulfill(util.array.flatten(joined));
      });
    });

    return results;
  };
};

/**
 * @constructor
 * @extends {Future}
 * @param {!QueryFilterSpec} spec
 * @throws {Error} If spec is not defined.
 */
Query = function (spec) {
  if (this.constructor === Query)
    return this;

  if (!spec)
    throw new Error('Query() requires a query spec as the only param.');

  Future.call(this);

  /**
   * @type {!QueryFilterSpec}
   */
  this.spec = spec;

  /**
   * @type {Array.<QueryFilterSpec>}
   */
  this.filters = [];

  return new QuerySpec(this);
};

Query.prototype = new Future();
Query.prototype.constructor = Query;

/**
 * @abstract
 * @return {Future}
 * @throws {Error} If not overridden by subclasses.
 */
Query.prototype.execute = function () {
  throw new Error('Query.execute() should be overridden by subclasses.');
};

/**
 * @expose
 */
services.search = /** @lends {ServiceContext.prototype.search} */{
}.service('search');