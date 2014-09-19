/**
 * @fileoverview Async function decorators.
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
 * @param {number} interval
 * @return {function(...)}
 */
Function.prototype.async;

Object.defineProperty(Function.prototype, 'async', {
  /**
   * @expose
   * @param {number} delay
   * @return {number}
   */
  value: /** @this {Function} */ function (delay) {
    var fn = this;

    if (typeof delay !== 'number');
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
 * @param {*=} value
 * @param {Error=} error
 * @return {PipelinedCallback}
 */
Function.prototype.pipe;

Object.defineProperty(Function.prototype, 'pipe', {
  /**
   * @expose
   * @param {*=} value
   * @param {Error=} error
   * @return {PipelinedCallback}
   */
  value: /** @this {Function} */ function (value, error) {
    var fn = this,
      piped;

    if (fn.__pipe__)
      return fn;

    piped = function (value, error) {
      if (error)
        throw error;

      return fn(value);
    };

    piped.__pipe__ = true;

    return (value || error) ? piped(value, error) : piped;
  }
});
