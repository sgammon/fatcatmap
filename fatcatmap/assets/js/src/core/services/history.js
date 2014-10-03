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

goog.require('support');
goog.require('service');
goog.require('services.router');

goog.provide('services.history');

/**
 * @expose
 */
services.history = /** @lends {ServiceContext.prototype.history} */ {
  /**
   * @expose
   * @param {string} url
   * @param {Object} state
   */
  push: function (url, state) {
    if (support.history.html5)
      window.history.pushState(state, '', url);
  },

  /**
   * @expose
   * @this {ServiceContext}
   */
  init: function () {
    var hist = this;

    hist.router.on('routed', function (url, request, response) {
      if (request.source !== 'history')
        services.history.push(url, response);
    });

    if (support.history.html5) {
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
