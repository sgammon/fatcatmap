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

goog.require('views.AppView');
goog.require('views.Detail');

goog.provide('views.Map');

/**
 * @constructor
 * @extends {views.AppView}
 * @param {VueOptions} options
 */
views.Map = views.AppView.extend({
  /**
   * @expose
   * @type {string}
   */
  viewname: 'map',

  /**
   * @expose
   * @type {Object}
   */
  data: {
    /**
     * @expose
     * @type {boolean}
     */
    active: true,

    /**
     * @expose
     * @type {?Object}
     */
    selected: null
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
    toggleDetail: function (e) {
      
    }
  }
});
