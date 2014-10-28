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
goog.require('service');
goog.require('services.rpc');
goog.require('services.data');
goog.require('models');

goog.provide('services.search');

/**
 * @expose
 */
services.search = /** @lends {ServiceContext.prototype.search} */{
  /**
   * @expose
   * @param {string} term
   * @returns {Future}
   * @this {ServiceContext}
   */
  autocomplete: function (term) {
    var search = this,
      matches = new Future();

    this.rpc.search.query({
      data: {
        term: term
      }
    }).then(
      /**
       * @param {Response} response
       * @param {Error} error
       */
      function (response, error) {
        if (error)
          return matches.fulfill(false, error);

        if (response.data.count === 0)
          return matches.fulfill([]);

        matches.fulfill(response.data.results.map(
          /**
           * @param {SearchResult} result
           */
          function (result) {
            result.data = models.Key.inflate(result.result.encoded).data() || {};
            return result;
          }));
      });

    return matches;
  }
}.service('search');
