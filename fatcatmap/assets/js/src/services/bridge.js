/**
 * @fileoverview Fatcatmap cross-origin messaging bridge.
 *
 * @author  David Rekow <david@momentum.io>,
 *          Sam Gammon <sam@momentum.io>,
 *          Alex Rosner <alex@momentum.io>,
 *          Ian Weisberger <ian@momentum.io>
 *
 * copyright (c) momentum labs, 2014
 */

goog.require('util.object');
goog.require('event');
goog.require('service');

goog.provide('services.bridge');

/**
 * @constructor
 * @extends {event.Emitter}
 * @param {string} origin Outbound (target) origin.
 * @param {?(string|Array.<string>)} allowed Accepted inbound origin(s).
 * @param {Window=} target Target window.
 * @throws {TypeError} If origin is not a string or allowed is not a string or list of strings.
 */
var Bridge = function (origin, allowed, target) {
  var bridge = this;

  if (typeof origin !== 'string')
    throw new TypeError('Bridge() requires an outbound origin string.');

  if (Array.isArray(allowed))
    allowed = '(' + allowed.join('|') + ')';

  if (typeof allowed !== 'string' && typeof allowed !== null)
    throw new TypeError('Bridge() requires an allowed inbound origin string or strings.');

  event.Emitter.call(this);

  allowed = allowed === '*' ? /.*/ : new RegExp(allowed);
  target = target || window;

  /**
   * @expose
   * @param {string} messageType
   * @param {*} content
   * @param {Object=} meta
   * @throws {TypeError} If messageType is not a string.
   */
  this.send = function (messageType, content, meta) {
    if (typeof messageType !== 'string')
      throw new TypeError('Bridge.send() requires a message type as the first parameter.');

    target.postMessage(/** @type {Message} */ ({
      type: messageType,
      content: content,
      meta: meta
    }), origin);
  };

  target.addEventListener('message', function (event) {
    if ((event.origin && !allowed.test(event.origin)) ||
        (event.source && event.source !== target))
      return;

    bridge.receive(/** @type {Message} */(event.data));
  });
};

util.object.inherit(Bridge, event.Emitter);

util.object.mixin(Bridge, /** @lends {Bridge.prototype} */{
  /**
   * @expose
   * @param {Message} message
   */
  receive: function (message) {
    if (message.type)
      this.emit(message.type, message.content, message.meta);
  }
});

/**
 * @expose
 */
services.bridge = {
  /**
   * @expose
   * @param {string} id
   * @param {string} origin
   * @param {?(string|Array.<string>)} allowed
   * @param {Window=} target
   * @return {Bridge}
   */
  create: function (id, origin, allowed, target) {
    return new Bridge(origin, allowed, target).service('bridge.' + id);
  }
}.service('bridge');
