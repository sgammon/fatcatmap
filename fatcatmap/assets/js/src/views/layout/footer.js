/**
 * @fileoverview view.View for the fcm footer.
 *
 * @author  David Rekow <david@momentum.io>,
 *          Sam Gammon <sam@momentum.io>,
 *          Alex Rosner <alex@momentum.io>,
 *          Ian Weisberger <ian@momentum.io>
 *
 * copyright (c) momentum labs, 2014
 */

goog.require('view');

goog.provide('views.layout.Footer');

/**
 * @constructor
 * @extends {view.View}
 * @param {VueOptions} options
 */
views.layout.Footer = view.View.extend({
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
