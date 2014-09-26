/**
 * @fileoverview Fatcatmap analytics service.
 *
 * @author  David Rekow <david@momentum.io>,
 *          Sam Gammon <sam@momentum.io>,
 *          Alex Rosner <alex@momentum.io>,
 *          Ian Weisberger <ian@momentum.io>
 * 
 * copyright (c) momentum labs, 2014
 * @todo implement with channel service
 */

goog.require('util.url');
goog.require('services');
goog.require('services.http');

goog.provide('services.tracking');

/**
 * @expose
 */
services.tracking = /** @lends {ServiceContext.prototype.tracking} */ {
}.service('tracking');