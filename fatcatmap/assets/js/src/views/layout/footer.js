/**
 * @fileoverview View for the fcm footer.
 *
 * @author  David Rekow <david@momentum.io>,
 *          Sam Gammon <sam@momentum.io>,
 *          Alex Rosner <alex@momentum.io>,
 *          Ian Weisberger <ian@momentum.io>
 *
 * copyright (c) momentum labs, 2014
 */

goog.require('View');

goog.provide('views.Footer');

/**
 * @constructor
 * @extends {View}
 * @param {VueOptions} options
 */
views.Footer = View.extend({
  /**
   * @expose
   * @type {string}
   */
  viewname: 'layout.footer',

  /**
   * @expose
   * @type {boolean}
   */
  replace: true
});
