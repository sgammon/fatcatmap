/**
 * @fileoverview Fatcatmap view service.
 *
 * @author  David Rekow <david@momentum.io>,
 *          Sam Gammon <sam@momentum.io>,
 *          Alex Rosner <alex@momentum.io>,
 *          Ian Weisberger <ian@momentum.io>
 * 
 * copyright (c) momentum labs, 2014
 */

goog.require('async');
goog.require('services');
goog.require('services.template');

goog.provide('services.view');

var VIEWS = {};

/**
 * @expose
 */
services.view = /** @lends {Client.prototype.view} */{
  /**
   * @expose
   * @param {string} viewname
   * @param {function(new:ViewModel)} viewclass
   * @return {function(new:ViewModel)}
   * @throws {TypeError}
   */
  register: function (viewname, viewclass) {
    if (typeof viewname !== 'string' || typeof viewclass !== 'function')
      throw new TypeError('services.view.register() takes a string name and constructor.');

    VIEWS[viewname] = viewclass;
    return viewclass;
  },

  /**
   * @expose
   * @param {string} viewname
   * @return {?function(new:ViewModel)}
   * @throws {TypeError}
   */
  get: function (viewname) {
    if (typeof viewname !== 'string')
      throw new TypeError('services.view.get() takes a string name.');

    return VIEWS[viewname];
  }
}.service('view')