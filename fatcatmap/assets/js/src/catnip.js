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

goog.require('support');
goog.require('service');
goog.require('services.router');
goog.require('services.history');
goog.require('services.template');
goog.require('services.view');
goog.require('services.data');
goog.require('services.graph');
goog.require('services.search');
goog.require('views.App');

goog.provide('catnip');

var READY, GO, catnip;

READY = [];

GO = function () {
  var cbs = READY;

  READY = null;

  cbs.forEach(function (fn) {
    fn();
  });
};

/**
 * @expose
 * @param {JSContext} context
 * @param {GraphData} data
 * @param {Object.<string, function(this:ServiceContext)>} routes
 * @this {ServiceContext}
 * @return {ServiceContext}
 */
catnip = function (context, data, routes) {

  var fcm = this;

  /**
   * @type {JSContext}
   */
  fcm._context = context;

  /**
   * @type {?Object}
   */
  fcm.session = null;

  if (context.session && context.session.established)
    fcm.session = context.session.payload;

  if (context.services && context.protocol.rpc.enabled) {
    fcm.rpc.init(context.services);
  } else {
    fcm.rpc = null;
  }

  if (context.template.manifest)
    fcm.services.template.init(context.template.manifest);

  if (data)
    fcm.services.data.init(data, function (graph) {
      fcm.services.graph.init(graph);
    });

  if (routes) {

    fcm.router.init(routes, function (initialRoute) {
      catnip.ready(function () {
        fcm.history.init();

        if (initialRoute)
          return fcm.router.route(initialRoute);
      });
    });

    fcm.services.view.init('app', /** @this {views.App} */function () {
      this.$set('active', true);

      this.nextTick(/** @this {views.App} */function () {
        this.$.stage.$set('active', true);
        ServiceContext.inject('app', this);
        GO();
      });
    });

  }

  return this;

}.inject();

/**
 * @param {function()=} cb
 * @return {*}
 * @throws {TypeError}
 */
catnip.ready = function (cb) {
  if (!(cb instanceof Function))
    throw new TypeError('catnip.ready() expects a function.');

  if (!READY)
    return cb();

  READY.push(cb);
};

/**
 * @expose
 * @type {views.App}
 */
ServiceContext.prototype.app;
