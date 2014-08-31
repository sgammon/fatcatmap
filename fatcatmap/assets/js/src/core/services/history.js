/**
 * @fileoverview History service, via HTML5 API or hashchange.
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
goog.require('services.router');

goog.provide('services.history');

/**
 * @expose
 */
services.history = /** @lends {Client.prototype.history} */ {
  /**
   * @expose
   * @param {string} url
   * @param {Object} state
   */
  push: supports.history.html5 ? function (url, state) {
    window.history.pushState(state, '', url);
  } : function (url, state) {},

  /**
   * @expose
   * @this {Client}
   */
  init: function () {
    var hist = this;

    hist.router.on('routed', function (url, request, response) {
      if (request.source !== 'history')
        services.history.push(url, request.state);
    });

    hist.router.back = function () {
      window.history.back();
    };

    hist.router.forward = function () {
      window.history.forward();
    };

    if (supports.history.html5) {
      window.onpopstate = function (event) {
        var request = {
          source: 'history',
          state: event.state || {}
        };

        hist.router.route(window.location.pathname, request);
      };
    }

    hist.init = function () {
      throw new Error('History already started');
    };
  }
}.service('history');
