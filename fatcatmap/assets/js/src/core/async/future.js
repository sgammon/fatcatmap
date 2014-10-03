/*jshint -W030 */
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

goog.require('util.array');
goog.require('util.object');
goog.require('async.decorators');

goog.provide('async.future');

var Future, MultiFuture;

/**
 * @constructor
 * @extends {Continuation}
 */
Future = function () {
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
  var waiting;

  if (value instanceof Future && value.status !== 'FULFILLED') {
    return value.then(this);
  }

  if (this.status !== 'PENDING') {
    value = false;
    error = new Error('Can\'t fulfill already-fulfilled Future.');
    error.source = this;
  }

  waiting = this._waiting;

  this.status = error ? 'FAILED' : 'FULFILLED';
  this._waiting = null;
  this._result = [value, error];

  waiting.forEach.bind(waiting, function (cb) {
    if (cb instanceof Future) {
      cb.fulfill(value, error);
    } else {
      cb.call(null, value, error);
    }
  }).async();

  return this;
};

/**
 * Returns a new Future waiting for the result of the current Future.
 * @param {(PipelinedCallback|Future)} waiting
 * @return {Future}
 */
Future.prototype.then = function (pending) {
  var next = new Future(),
    cb;

  if (pending instanceof Future) {
    pending.then(next);

    if (!this._waiting) {
      pending.fulfill.apply(pending, this._result);
    } else {
      this._waiting.push(pending);
    }
  } else {
    cb = function (value, error) {
      if (error)
        return next.fulfill(false, error);

      try {
        next.fulfill(pending(value, error));
      } catch (e) {
        next.fulfill(false, e);
      }
    };

    if (!this._waiting) {
      cb.apply(null, this._result);
    } else {
      this._waiting.push(cb);
    }
  }

  return next;
};

/**
 * @constructor
 * @extends {Future}
 * @param {...[*]} futures
 */
MultiFuture = function (futures) {
  var mfuture = this;

  futures = util.array.normalize(futures);

  Future.call(this);

  /**
   * @protected
   * @type {Array.<*>}
   */
  this._unresolved = [];

  /**
   * @protected
   * @type {number}
   */
  this._resolving = 0;

  this.all(futures);
};

util.object.inherit(MultiFuture, Future);

/**
 * Adds an additional unresolved value to the MultiFuture.
 * @param {*} unresolved
 * @throws {Error} If current MultiFuture is already fulfilled.
 */
MultiFuture.prototype.add = function (unresolved) {
  var mfuture = this,
    i;

  if (this.status !== 'PENDING')
    throw new Error('Can\'t add to already-fulfilled MultiFuture.');

  i = this._unresolved.push(unresolved) - 1;
  this._resolving += 1;

  if (unresolved instanceof Future)
    unresolved.then(function (v, e) {
      if (e && !mfuture.error)
        return mfuture.fulfill(false, e);
      
      mfuture._unresolved[i] = v;

      if (--mfuture._resolving === 0)
        mfuture.fulfill(mfuture._unresolved);
    });
};

/**
 * Waits for all unresolved values to resolve before fulfilling.
 * @param {Array.<*>} unresolved
 * @return {Future}
 */
MultiFuture.prototype.all = function (unresolved) {
  var mfuture = this;

  unresolved.forEach(function (_unresolved) {
    mfuture.add(_unresolved);
  });

  return this.then();
};

/**
 * Waits for the first unresolved value to resolve before fulfilling.
 * @param {Array.<*>} unresolved
 * @return {Future}
 */
MultiFuture.prototype.any = function (unresolved) {
  var result = this.all(unresolved);

  this._resolving = 1;

  return result;
};

/**
 * Returns a new Future waiting for the result of the current MultiFuture.
 * @override
 * @param {(PipelinedCallback|Future)} waiting
 * @return {Future}
 */
MultiFuture.prototype.then = function (waiting) {
  var result = Future.prototype.then.call(this, waiting);

  if (this._unresolved.length === 0)
    this.fulfill(this._unresolved);

  return result;
};

/**
 * @expose
 * @param {(Continuation|*)} next
 * @param {Error=} err
 * @return {Future}
 */
Function.prototype.pipe;

Object.defineProperty(Function.prototype, 'pipe', {
  /**
   * @expose
   * @param {(Continuation|*)} next
   * @param {Error=} err
   * @return {Future}
   * @this {Function}
   */
  value: function (next, err) {
    var fn = this,
      piped = new Future(),
      cb = function (value, error) {
        if (err)
          return piped.fulfill(false, err);

        if (error)
          return piped.fulfill(false, error);

        try {
          piped.fulfill(fn(value));
        } catch (e) {
          piped.fulfill(false, e);
        }
      };

    if (next && next.then && typeof next.then === 'function') {
      next.then(cb);
    } else {
      cb.bind(null, next).async();
    }

    return piped;
  }
});
