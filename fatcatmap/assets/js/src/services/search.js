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

goog.require('service');
goog.require('services.rpc');

goog.provide('services.search');

/**
 * @expose
 */
services.search = /** @lends {ServiceContext.prototype.search} */{
  /**
   * @expose
   * @param {string} term
   * @returns {Future}
   */
  autocomplete: function (term) {
    return this.rpc.search.query({
      request: {
        term: term
      }
    });
  }
}.service('search');
