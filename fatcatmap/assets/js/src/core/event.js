/*jshint -W030 */
/**
 * @fileoverview Event emitter.
 *
 * @author  David Rekow <david@momentum.io>,
 *          Sam Gammon <sam@momentum.io>,
 *          Alex Rosner <alex@momentum.io>,
 *          Ian Weisberger <ian@momentum.io>
 *
 * copyright (c) momentum labs, 2014
 */

goog.require('util.object');

goog.provide('event');

/**
 * @constructor
 * @param {string=} _events
 *
 */
var Emitter = function (_events) {
  var events = {};

  if (typeof _events !== 'string')
    _events = '';

  Object.defineProperty(this, 'events', {
    /**
     * @expose
     * @return {Object.<string, Array.<function(...[*])>}
     */
    get: function () {
      return events;
    }
  });

  _events.split(' ').forEach(function (event) {
    events[event] = [];
  });
};

util.object.mixin(Emitter, /** @lends {Emitter.prototype} */ {
  /**
   * @expose
   * @param {string} event
   * @param {function(...[*])} cb
   */
  on: function (event, cb) {
    if (!this.events[event])
      this.events[event] = [];

    this.events[event].push(cb);
  },

  /**
   * @expose
   * @param {string} event
   * @param {function (...[*])=} cb
   */
  off: function (event, cb) {
    var i;

    if (!callback) {
      this.events[event] = [];
    } else {
      i = this.events[event].indexOf(cb);

      if (i > -1)
        this.events[event].splice(i, 1);
    }
  },

  /**
   * @expose
   * @param {string} event
   * @param {...[*]} args
   */
  emit: function (event, args) {
    var emitter = this,
      cbs = this.events[event];

    if (cbs && cbs.length) {
      args = Array.prototype.slice.call(arguments, 1);

      cbs.forEach(function (cb) {
        cb.apply(emitter, args);
      });
    }
  }
});

/**
 * @expose
 * @type {Object.<string, Array.<function(...[*])>}
 */
Emitter.prototype.events;

/**
 * @expose
 */
event.Emitter = Emitter;
