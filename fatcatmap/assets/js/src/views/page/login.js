/**
 * @fileoverview Map view.
 *
 * @author  David Rekow <david@momentum.io>,
 *          Sam Gammon <sam@momentum.io>,
 *          Alex Rosner <alex@momentum.io>,
 *          Ian Weisberger <ian@momentum.io>
 * 
 * copyright (c) momentum labs, 2014
 */

goog.require('$');
goog.require('async');
goog.require('validation');
goog.require('View');

goog.provide('views.page.Login');

/**
 * @constructor
 * @extends {View}
 * @param {VueOptions} options
 */
views.page.Login = View.extend({
  /**
   * @expose
   * @type {string}
   */
  viewname: 'page.login',

  /**
   * @expose
   * @type {boolean}
   */
  replace: true,

  /**
   * @expose
   * @type {Object.<string, function(...[*])>}
   */
  methods: {
    /**
     * @expose
     * @param {MouseEvent} e
     * @this {views.page.Login}
     */
    login: function (e) {
      e.preventDefault();
      e.stopPropagation();
      console.log('Login.login() called.');
    },

    /**
     * @expose
     * @param {MouseEvent} e
     * @this {views.page.Login}
     */
    signup: function (e) {
      e.preventDefault();
      e.stopPropagation();
      console.log('Login.signup() called.');
    }
  },

  /**
   * @expose
   * @type {Object.<string, *>}
   */
  data: {
    /**
     * @expose
     * @type {?string}
     */
    session: null
  }
});
