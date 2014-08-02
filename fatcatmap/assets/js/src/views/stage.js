/**
 * @fileoverview View for the fcm stage.
 *
 * @author  David Rekow <david@momentum.io>,
 *          Sam Gammon <sam@momentum.io>,
 *          Alex Rosner <alex@momentum.io>,
 *          Ian Weisberger <ian@momentum.io>
 * 
 * copyright (c) momentum labs, 2014
 */

goog.require('View');

goog.provide('views.Stage');

/**
 * @constructor
 * @extends {View}
 * @param {VueOptions} options
 */
views.Stage = View.extend({
  /**
   * @expose
   * @type {string}
   */
  viewname: 'stage',

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
     * @type {boolean}
     */
    active: true
  }
});
