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

goog.provide('views.Page');

/**
 * @constructor
 * @extends {Vue}
 * @param {VueOptions} options
 */
views.Page = Vue.extend({
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
     * @param {MouseEvent} e
     */
    route: function (e) {
      if (e.target.hasAttribute('data-route')) {
        var route = e.target.getAttribute('href');
        e.preventDefault();
        e.stopPropagation();
        services.router.route(route);
      }
    }
  },

  /**
   * @expose
   * @this {views.Page}
   */
  ready: function () {
    this.$on('route', function (route) {
      services.router.route(route);
    });
  }
});

services.view.put('page', views.Page);
