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
goog.require('views.layout.Stage');
goog.require('views.layout.Header');
goog.require('views.layout.Footer');
goog.require('views.component.Modal');
goog.require('views.page.Login');
goog.require('views.page.Map');

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
  methods: /** @lends {View.prototype.$root} */{
    /**
     * @expose
     * @param {MouseEvent} e
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
     * @param {Error} e
     * @this {views.App}
     */
    error: function (e) {
      if (this.debug)
        console.error(e);

      this.$emit('route', '/404', { error: e });
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

/**
 * @expose
 * @type {views.layout.Stage}
 */
views.App.prototype.$.stage;

/**
 * @expose
 * @type {views.Modal}
 */
views.App.prototype.$.modal;

/**
 * @expose
 * @type {views.page.Map}
 */
views.layout.Stage.prototype.$.map;


services.view.put('app', views.App);
