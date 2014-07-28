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

goog.require('view.AppView')
goog.require('view.Header');
goog.require('view.Stage');

goog.provide('view.Container');

/**
 * @constructor
 * @extends {view.AppView}
 * @param {VueOptions=} options
 */
view.Container = view.AppView.extend({
  /**
   * @expose
   * @type {string}
   */
  viewname: 'container',

  /**
   * @expose
   * @type {Array.<string>}
   */
  children: ['header', 'stage']
});
