/**
 * @fileoverview Router for node detail view.
 *
 * @author  David Rekow <david@momentum.io>,
 *          Sam Gammon <sam@momentum.io>,
 *          Alex Rosner <alex@momentum.io>,
 *          Ian Weisberger <ian@momentum.io>
 * 
 * copyright (c) momentum labs, 2014
 */

goog.require('View');

goog.provide('views.Detail');

/**
 * @constructor
 * @extends {View}
 * @param {VueOptions} options
 */
views.Detail = View.extend({
  /**
   * @expose
   * @type {string}
   */
  viewname: 'detail',

  /**
   * @expose
   * @type {boolean}
   */
  replace: true,

  /**
   * @expose
   * @type {Object}
   */
  data: {
    /**
     * @expose
     * @type {string}
     */
    view: '',

    /**
     * @expose
     * @type {?Object}
     */
    selected: null
  },

  /**
   * @expose
   * @this {views.Detail}
   */
  handler: function (data) {
    this.$set('view', data.kind.toLowerCase());
    this.$set('selected', data);
  }
});