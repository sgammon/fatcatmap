/**
 * @fileoverview Core application namespace.
 *
 * @author  David Rekow <david@momentum.io>,
 *          Sam Gammon <sam@momentum.io>,
 *          Alex Rosner <alex@momentum.io>,
 *          Ian Weisberger <ian@momentum.io>
 * 
 * copyright (c) momentum labs, 2014
 */

goog.require('routes');
goog.require('supports');
goog.require('services');
goog.require('services.router');
goog.require('services.history');
goog.require('services.graph');
goog.require('services.map');

goog.provide('catnip');

/**
 * @param {JSContext} context
 * @param {PageData} data
 * @this {Client}
 * @return {Client}
 */
var catnip = function (context, data) {
  /**
   * @expose
   * @type {JSContext}
   */
  this._context = context;

  /**
   * @expose
   * @type {?Object}
   */
  this.session = null;

  if (context.session && context.session.established)
    this.session = context.session.payload;

  if (context.services && context.protocol.rpc.enabled)
    this.rpc.init(context.services, context.protocol.rpc.host);

  this.router.init(ROUTES);
  this.history.start();

  this.graph.init(data);

  return this;
}.client();
