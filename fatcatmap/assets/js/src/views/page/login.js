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
goog.require('View');

goog.provide('views.Login');

/**
 * @constructor
 * @extends {View}
 * @param {VueOptions} options
 */
views.Login = View.extend({
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
     * @this {views.Login}
     */
    login: function (e) {
      e.preventDefault();
      e.stopPropagation();
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
