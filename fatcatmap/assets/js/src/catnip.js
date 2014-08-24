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

goog.require('supports');

goog.require('services');
goog.require('services.router');
goog.require('services.history');
goog.require('services.template');
goog.require('services.view');
goog.require('services.graph');

goog.require('views.Page');

goog.provide('catnip');

var _ready, _go, catnip;

_ready = [];

_go = function () {
  var cbs = _ready;

  _ready = null;

  cbs.forEach(function (fn) {
    fn();
  });
};

/**
 * @expose
 * @param {JSContext} context
 * @param {PageData} data
 * @param {Object.<string, function(this:Client)>} routes
 * @this {Client}
 * @return {Client}
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

    if (context.services && context.protocol.rpc.enabled)
      fcm.rpc.init(context.services);

    if (context.template.manifest)
      fcm.template.init(context.template.manifest);

    fcm.data.init(data, function (d) {
      fcm.graph.init(d);
    });

    fcm.router.init(routes, function (initialRoute) {
      fcm.ready(function () {
        fcm.history.init();

        if (initialRoute)
          return fcm.router.route(initialRoute);
      });
    });

    fcm.view.init('page', /** @this {Vue} */function () {
      this.$set('active', true);
      this.$.stage.$set('active', true);
      services.service._register('app', this);
      _go();
    });

    return this;
}.client({
  /**
   * @param {function()} cb
   */
  ready: function (cb) {
    if (!cb)
      return;

    if (!_ready)
      return cb();

    _ready.push(cb);
  }
});
