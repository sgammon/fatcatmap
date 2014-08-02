/**
 * @fileoverview Catnip route declarations.
 *
 * @author  David Rekow <david@momentum.io>,
 *          Sam Gammon <sam@momentum.io>,
 *          Alex Rosner <alex@momentum.io>,
 *          Ian Weisberger <ian@momentum.io>
 * 
 * copyright (c) momentum labs, 2014
 */

goog.require('async');

goog.provide('routes');

var routes = {
  /**
   * @param {Object} request
   * @return {?Object}
   * @this {Client}
   */
  '/': function (request) {
    this.catnip.app.$set('page.route', '/');
    return null;
  },

  /**
   * @param {Object} request
   * @return {?Object}
   */
  '/login': function (request) {

  },

  /**
   * @param {Object} request
   * @return {?Object}
   */
  '/settings': function (request) {

  },

  /**
   * @param {Object} request
   * @return {?Object}
   * @this {Client}
   */
  '/beta': function (request) {
    this.catnip.app.$set('page.route', '/beta');
    return null;
  },

  /**
   * @param {Object} request
   * @return {?Object}
   */
  '/404': function (request) {

  },

  /**
   * @param {Object} request
   * @return {?Object}
   * @this {Client}
   */
  '/<key>': function (request) {
    var _this = this;

    _this.data.get(request.args.key, {
      /**
       * @expose
       * @param {Object} data
       */
      success: function (data) {
        this.catnip.app.$broadcast('detail', data);
      },

      /**
       * @expose
       * @param {Error} e
       */
      error: function (e) {
        request.error = e;
        _this.router.route('/404', request);
      }
    });

    return null;
  },

  /**
   * @param {Object} request
   * @return {?Object}
   */
  '/<key1>/and/<key2>': function (request) {

  }
};
