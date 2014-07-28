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
goog.require('services.template');
goog.require('services.graph');
goog.require('services.map');

goog.require('view.Container');


goog.provide('catnip');

/**
 * @param {JSContext} context
 * @param {PageData} data
 * @this {Client}
 * @return {Client}
 */
var catnip = function (context, data) {
  var fcm = this;

  /**
   * @expose
   * @type {JSContext}
   */
  fcm._context = context;

  /**
   * @expose
   * @type {?Object}
   */
  fcm.session = null;

  if (context.session && context.session.established)
    fcm.session = context.session.payload;

  if (context.services && context.protocol.rpc.enabled)
    fcm.rpc.init(context.services);

  if (context.template.manifest)
    fcm.template.init(context.template.manifest);

  fcm.router.init(routes);
  fcm.history.start();

  fcm.graph.init(data);

  return this;
}.client();
