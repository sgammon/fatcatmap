/**
 * @fileoverview Index generation & persistence service.
 *
 * @author  David Rekow <david@momentum.io>,
 *          Sam Gammon <sam@momentum.io>,
 *          Alex Rosner <alex@momentum.io>,
 *          Ian Weisberger <ian@momentum.io>
 *
 * copyright (c) momentum labs, 2014
 */

goog.require('async.task');
goog.require('async.future');
goog.require('support');
goog.require('service');
goog.require('services.storage');

goog.provide('services.indexer');

/**
 * @expose
 */
services.indexer = /** @lends {ServiceContext.prototype.indexer} */{
}.service('indexer');
