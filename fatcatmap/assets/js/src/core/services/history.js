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
var history = {
  /**
   * @param {string} url
   * @param {object} state
   */
  push: supports.history.html5 ? function (url, state) {
    window.history.pushState(state, '', url);
  } : function (url, state) {},

  start: function () {
    var hist = this;

    hist.router.on('routed', function (url, request, response) {
      if (request.source !== 'history') {
        hist.push(url, request.state);
      }
    });

    if (supports.history.html5) {
      window.onpopstate = function (event) {
        var request = {
          source: 'history',
          state: event.state || {}
        };

        hist.router.route(window.location.pathname, request);
      };
    }

    hist.start = function () {
      throw new Error('History already started');
    };
  }
}.service('history');
