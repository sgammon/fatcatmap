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
goog.require('services.view');
goog.require('services.graph');
goog.require('services.map');

goog.require('views.Page');
goog.require('views.Map');

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
 */
catnip = services.catnip = /** @lends {Client.prototype.catnip} */{
  /**
   * @param {JSContext} context
   * @param {PageData} data
   * @this {Client}
   * @return {Client}
   */
  init: function (context, data) {
    var fcm = this;

    /**
     * @type {JSContext}
     */
    fcm._context = context;

    /**
     * @type {?Object}
     */
    fcm.session = null;

    /**
     * @type {?Vue}
     */
    fcm.app = null;

    if (context.session && context.session.established)
      fcm.session = context.session.payload;

    if (context.services && context.protocol.rpc.enabled)
      fcm.rpc.init(context.services);

    if (context.template.manifest)
      fcm.template.init(context.template.manifest);

    fcm.view.init('page', /** @this {Vue} */function () {
      this.$set('active', true);
      services.catnip.app = this;
      _go();
    });

    fcm.router.init(routes, function (initialRoute) {
      
      fcm.catnip.ready(function () {

        fcm.history.init();

        if (initialRoute)
          return fcm.router.route(initialRoute);

        fcm.router.route('/beta');
      });
    });

    services.catnip.init = function () {
      return fcm;
    };

    return this;
  },

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

}.service('catnip');
