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

goog.require('views.AppView');

goog.provide('views.Stage');

/**
 * @constructor
 * @extends {views.AppView}
 * @param {VueOptions=} options
 */
views.Stage = views.AppView.extend({
  /**
   * @expose
   * @type {string}
   */
  viewname: 'stage'
});
