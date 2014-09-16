/**
 * @fileoverview Top-level page manager - root of the client app.
 *
 * @author  David Rekow <david@momentum.io>,
 *          Sam Gammon <sam@momentum.io>,
 *          Alex Rosner <alex@momentum.io>,
 *          Ian Weisberger <ian@momentum.io>
 * 
 * copyright (c) momentum labs, 2014
 */

goog.require('services.router');
goog.require('services.view');
goog.require('views.Header');
goog.require('views.Modal');
goog.require('views.Stage');
goog.require('views.Map');
goog.require('views.page.Login');

goog.provide('views.App');

/**
 * @constructor
 * @extends {Vue}
 * @param {VueOptions} options
 */
views.App = Vue.extend({
  /**
   * @expose
   * @type {Object}
   */
  data: {

    /**
     * @expose
     * @type {Object}
     */
    page: {
      /**
       * @expose
       * @type {boolean}
       */
      active: false
    },

    /**
     * @expose
     * @type {?Object}
     */
    modal: null
  },

  /**
   * @expose
   * @type {Object}
   */
  methods: {
    /**
     * @expose
     * @param {(MouseEvent|string)} e
     * @this {views.App}
     */
    route: function (e) {
      var route;

      if (e.target && e.target.hasAttribute('data-route')) {
        route = e.target.getAttribute('href');
        e.preventDefault();
        e.stopPropagation();
      }

      if (route) {
        this.$emit('route', route);
      }
    },

    /**
     * @expose
     * @param {function()} cb
     */
    nextTick: function (cb) {
      return Vue.nextTick(cb);
    }
  },

  /**
   * @expose
   * @this {views.App}
   */
  ready: function () {
    this.$on('route', function (route, request) {
      services.router.route(route, request);
    });
  }
});

services.view.put('app', views.App);
