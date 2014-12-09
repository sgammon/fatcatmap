/**
 * @fileoverview Fatcatmap search models.
 *
 * @author  David Rekow <david@momentum.io>,
 *          Sam Gammon <sam@momentum.io>,
 *          Alex Rosner <alex@momentum.io>,
 *          Ian Weisberger <ian@momentum.io>
 *
 * copyright (c) momentum labs, 2014
 */

goog.require('util.object');
goog.require('async.future');

goog.provide('models.search');

/**
 * @typedef {Object}
 */
var QueryFilterSpec;

var QuerySpec, Query;

/**
 * @private
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
    /*jshint eqnull:true */
    if (limit != null)
      /** @expose */
      query.limit = limit;

    return this;
  };

  /**
   * @expose
   * @param {Query=} query
   * @return {QuerySpec}
   */
  this.join = function (_query) {
    if (_query instanceof QuerySpec)
      joined.push(_query);

    return this;
  };

  /**
   * @expose
   * @param {Object} options
   * @return {Future}
   */
  this.execute = function (options) {
    var results;

    if (joined.length === 0)
      return query.execute(options);

    results = new MultiFuture(joined.map(function (_query) {
      return _query.execute();
    })).then(function (joined, error) {
      if (error)
        return results.fulfill(false, error);

      query.execute(options).then(function (_results, error) {
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
 * @param {number=} limit
 * @throws {Error} If spec is not defined.
 */
Query = function (limit) {
  Future.call(this);

  /**
   * @type {Array.<QueryFilterSpec>}
   */
  this.filters = [];

  /**
   * @type {?number}
   */
  this.limit = limit || null;

  return new QuerySpec(this);
};

util.object.inherit(Query, Future);

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
models.search = {
  /**
   * @expose
   * @constructor
   * @extends {Future}
   * @param {number=} limit
   * @throws {Error} If spec is not defined.
   */
  Query: Query
};
