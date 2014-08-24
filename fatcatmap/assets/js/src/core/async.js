/**
 * @fileoverview Async utilities.
 *
 * @author  David Rekow <david@momentum.io>,
 *          Sam Gammon <sam@momentum.io>,
 *          Alex Rosner <alex@momentum.io>,
 *          Ian Weisberger <ian@momentum.io>
 * 
 * copyright (c) momentum labs, 2014
 */

goog.provide('async');


/**
 * Represents an asynchronous callback object.
 * @typedef {{
 *    success: function(Object),
 *    error: function(Error)
 * }}
 */
var CallbackMap;


Object.defineProperty(Function.prototype, 'throttle', {
  /**
   * @expose
   * @param {number} interval
   * @return {function(...)}
   */
  value: /** @this {Function} */ function (interval) {
    var fn = this,
      timerID, args, that;

    return function () {
      args = arguments;
      that = this;
      if (!timerID) {
        setTimeout(function () {
          timerID = null;
          fn.apply(that, args);
        }, interval);
      }
    };
  }
});

/**
 * @expose
 * @param {number} interval
 * @return {function(...)}
 */
Function.prototype.throttle;