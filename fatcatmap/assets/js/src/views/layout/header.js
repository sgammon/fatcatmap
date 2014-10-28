/**
 * @fileoverview view.View for the fcm header.
 *
 * @author  David Rekow <david@momentum.io>,
 *          Sam Gammon <sam@momentum.io>,
 *          Alex Rosner <alex@momentum.io>,
 *          Ian Weisberger <ian@momentum.io>
 *
 * copyright (c) momentum labs, 2014
 */

goog.require('view');
goog.require('views.component.Autocomplete');

goog.provide('views.layout.Header');

/**
 * @constructor
 * @extends {view.View}
 * @param {VueOptions} options
 */
views.layout.Header = view.View.extend({
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
