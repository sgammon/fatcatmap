/**
 * @fileoverview View for the fcm header.
 *
 * @author  David Rekow <david@momentum.io>,
 *          Sam Gammon <sam@momentum.io>,
 *          Alex Rosner <alex@momentum.io>,
 *          Ian Weisberger <ian@momentum.io>
 * 
 * copyright (c) momentum labs, 2014
 */

goog.require('View');

goog.provide('views.Header');

/**
 * @constructor
 * @extends {View}
 * @param {VueOptions} options
 */
views.Header = View.extend({
  /**
   * @expose
   * @type {string}
   */
  viewname: 'layout.header',

  /**
   * @expose
   * @type {boolean}
   */
  replace: true
});
