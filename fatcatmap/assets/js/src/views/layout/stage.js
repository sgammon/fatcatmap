/**
 * @fileoverview view.View for the fcm stage.
 *
 * @author  David Rekow <david@momentum.io>,
 *          Sam Gammon <sam@momentum.io>,
 *          Alex Rosner <alex@momentum.io>,
 *          Ian Weisberger <ian@momentum.io>
 *
 * copyright (c) momentum labs, 2014
 */

goog.require('view');

goog.provide('views.layout.Stage');

/**
 * @constructor
 * @extends {view.View}
 * @param {VueOptions} options
 */
views.layout.Stage = view.View.extend({
  /**
   * @expose
   * @type {string}
   */
  viewname: 'layout.stage',

  /**
   * @expose
   * @type {boolean}
   */
  replace: true
});
