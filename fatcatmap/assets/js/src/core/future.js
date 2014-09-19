/**
 * @fileoverview Future class.
 *
 * @author  David Rekow <david@momentum.io>,
 *          Sam Gammon <sam@momentum.io>,
 *          Alex Rosner <alex@momentum.io>,
 *          Ian Weisberger <ian@momentum.io>
 * 
 * copyright (c) momentum labs, 2014
 */
goog.require('async');
goog.provide('future');

/**
 * @constructor
 */
var Future = function () {
  /**
   * @type {string}
   */
  this.status = 'PENDING';

  /**
   * @private
   * @type {?Array.<PipelinedCallback>}
   */
  this._waiting = [];

  /**
   * @private
   * @type {?Array.<*>}
   */
  this._result = null;
};

/**
 * Fulfills the current Future with a value or error.
 * @param {*} value Promised value, or false if an error occurred.
 * @param {Error=} error If fulfill failed, error to pass to waiting callbacks.
 * @throws {Error} If fulfill is called on an already-fulfilled Future.
 * @return {Future}
 */
Future.prototype.fulfill = function (value, error) {
  if (this.status !== 'PENDING') {
    value = false;
    error = new Error('Can\'t fulfill already-fulfilled future.');
    error.source = this;
  }

  if (value instanceof Future && value.status !== 'FULFILLED') {
    return value.then(this);
  }

  this._waiting.forEach(function (cb) {
    (function () {
      if (cb instanceof Future) {
        cb.fulfill(value, error);
      } else {
        cb(value, error);
      }
    }).async();
  });

  this.status = error ? 'FAILED' : 'FULFILLED';
  this._waiting = null;
  this._result = [value, error];

  return this;
};

/**
 * Returns a new Future waiting for the result of the current Future.
 * @param {(PipelinedCallback|Future)}
 * @return {Future}
 */
Future.prototype.then = function (waiting) {
  var next = new Future(),
    cb = function (value, error) {
      var result;
      if (waiting instanceof Future) {
        waiting.then(function (v, e) { next.fulfill(v, e); });
        waiting.fulfill(value, error);
      } else {
        try {
          result = waiting(value, error);
        } catch (e) {
          return next.fulfill(false, e);
        }

        next.fulfill(result);
      }
    };

  if (this._result) {
    cb.apply(null, this._result);
  } else {
    this._waiting.push(cb);
  }

  return next;
};
