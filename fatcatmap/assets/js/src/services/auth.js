/**
 * @fileoverview Fatcatmap auth & session service.
 *
 * @author  David Rekow <david@momentum.io>,
 *          Sam Gammon <sam@momentum.io>,
 *          Alex Rosner <alex@momentum.io>,
 *          Ian Weisberger <ian@momentum.io>
 * 
 * copyright (c) momentum labs, 2014
 */

goog.require('service');
goog.require('services.storage');

goog.provide('services.auth');

/**
 * @expose
 */
services.auth = /** @lends {ServiceContext.prototype.auth} */ {
}.service('auth');