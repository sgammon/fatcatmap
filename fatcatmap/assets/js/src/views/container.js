/**
 * @fileoverview Top-level view manager - root of the client app.
 *
 * @author  David Rekow <david@momentum.io>,
 *          Sam Gammon <sam@momentum.io>,
 *          Alex Rosner <alex@momentum.io>,
 *          Ian Weisberger <ian@momentum.io>
 * 
 * copyright (c) momentum labs, 2014
 */

goog.require('services');
goog.require('services.template');
goog.require('views.AppView');

goog.provide('views.Container');

/**
 * @constructor
 * @extends {views.AppView}
 * @param {VueOptions=} options
 */
views.Container = views.AppView.extend({
  /**
   * @expose
   * @type {string}
   */
  viewname: 'container'
});
