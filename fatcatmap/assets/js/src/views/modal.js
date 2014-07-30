/**
 * @fileoverview Modal view.
 *
 * @author  David Rekow <david@momentum.io>,
 *          Sam Gammon <sam@momentum.io>,
 *          Alex Rosner <alex@momentum.io>,
 *          Ian Weisberger <ian@momentum.io>
 * 
 * copyright (c) momentum labs, 2014
 */

goog.require('views.AppView');

goog.provide('views.Modal');

/**
 * @constructor
 * @extends {views.AppView}
 * @param {VueOptions} options
 */
views.Modal = views.AppView.extend({
  /**
   * @expose
   * @type {string}
   */
  viewname: 'modal',

  /**
   * @expose
   * @type {Object}
   */
  data: {
    /**
     * @expose
     * @type {boolean}
     */
    active: false,

    /**
     * @expose
     * @type {string}
     */
    message: ''
  }
});