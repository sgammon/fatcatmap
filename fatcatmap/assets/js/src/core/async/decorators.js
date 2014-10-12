/*jshint -W030 */
/**
 * @fileoverview Async utility function decorators.
 *
 * @author  David Rekow <david@momentum.io>,
 *          Sam Gammon <sam@momentum.io>,
 *          Alex Rosner <alex@momentum.io>,
 *          Ian Weisberger <ian@momentum.io>
 * 
 * copyright (c) momentum labs, 2014
 */

goog.provide('async.decorators');

/**
 * @expose
 * @param {number=} delay
 * @return {number} Timer ID.
 */
Function.prototype.async;

Object.defineProperty(Function.prototype, 'async', {
  /**
   * @expose
   * @param {number=} delay
   * @return {number} Timer ID.
   * @this {Function}
   */
  value: function (delay) {
    var fn = this;

    if (typeof delay !== 'number')
      delay = 0;

    return setTimeout(this, delay);
  }
});

/**
 * @expose
 * @param {number} interval
 * @return {function(...)}
 */
Function.prototype.throttle;

Object.defineProperty(Function.prototype, 'throttle', {
  /**
   * @expose
   * @param {number} interval
   * @return {function(...)}
   * @this {Function}
   */
  value: function (interval) {
    var fn = this,
      timerID, args, that;

    return function () {
      args = arguments;
      that = this;
      if (!timerID) {
        timerID = setTimeout(function () {
          timerID = null;
          fn.apply(that, args);
        }, interval);
      }
    };
  }
});

/**
 * @expose
 * @param {number} delay
 * @return {function(...)}
 */
Function.prototype.debounce;

Object.defineProperty(Function.prototype, 'debounce', {
  /**
   * @expose
   * @param {number} delay
   * @param {boolean=} triggerFirst
   * @return {function(...)}
   * @this {Function}
   */
  value: function (delay, triggerFirst) {
    var fn = this,
      timerID, args, that;

    return function () {
      var cb = function () { fn.apply(that, args); };

      args = arguments;
      that = this;

      if (!timerID) {
        if (triggerFirst === true)
          cb();
      } else {
        clearTimeout(timerID);
      }

      timerID = setTimeout(cb, delay);
    }
  }
});
