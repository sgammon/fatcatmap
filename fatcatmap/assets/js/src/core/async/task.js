/*jshint -W030 */
/**
 * @fileoverview Asynchronous task class.
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
goog.require('async.future');

goog.provide('async.task');

/**
 * @typedef {function(this: Task, ...[*]): (Array.<*>|Task|Future|null)}
 */
var Tasklet;

var TaskSpec, Task;

/**
 * Manages declaring dependent Tasklets for a Task.
 * @constructor
 * @extends {Continuation}
 * @param {Task} task
 */
TaskSpec = function (task) {
  /**
   * @expose
   * @param {Tasklet} fn
   * @return {TaskSpec}
   */
  this.then = function (fn) {
    task._steps.push(fn);
    return this;
  };

  /**
   * @expose
   * @param {Tasklet=} fn
   * @return {Task}
   */
  this.done = function (fn) {
    if (fn)
      task._complete = fn;

    return task;
  };
};

/**
 * @constructor
 * @extends {Future}
 * @param {Tasklet=} first
 */
Task = function (first) {
  Future.call(this);

  /**
   * @protected
   * @this {Task}
   */
  this.resume = this.resume.bind(this);

  /**
   * @expose
   * @type {boolean}
   */
  this.done = false;

  /**
   * @expose
   * @type {?Error}
   */
  this.error = null;

  /**
   * @protected
   * @type {Array.<*>}
   */
  this._args = [];

  /**
   * @protected
   * @type {Array.<Tasklet>}
   */
  this._steps = [];

  /**
   * @protected
   * @type {?Tasklet}
   */
  this._complete = null;

  /**
   * @protected
   * @type {number}
   */
  this._step = 0;

  /**
   * @protected
   * @type {boolean}
   */
  this._finishing = false;

  if (typeof first === 'function')
    return this.first(first);
};

util.object.inherit(Task, Future);

/**
 * Make <code>Task.fulfill</code> a no-op.
 * @return {Task}
 */
Task.prototype.fulfill = function () {
  return this;
};

/**
 * Resets the Task execution state.
 * @expose
 * @return {Task}
 */
Task.prototype.reset = function () {
  this.error = null;
  this._args = [];
  this._waiting = []
  this._step = 0;
  this._finishing = false;

  if (this._complete && this._complete.__task__)
    this._complete = this._complete.__orig__;

  return this;
};

/**
 * Sets the initial Tasklet step and returns chainable TaskSpec to add steps.
 * @expose
 * @param {Tasklet} fn
 * @return {TaskSpec}
 * @throws {Error} If <code>first</code> has already been called.
 */
Task.prototype.first = function (fn) {
  if (this._steps.length)
    throw new Error('Task.first() can only be called once.');

  return new TaskSpec(this).then(fn);
};

/**
 * Sets the initial argument set.
 * @expose
 * @param {...[*]} args
 */
Task.prototype.args = function (args) {
  this._args = util.array.normalize(args);
};

/**
 * Schedules the initial task step and stores any passed arguments to execute with.
 * @expose
 * @param {...[*]} args Arguments to pass in addition to any partially-applied args.
 */
Task.prototype.run = function (args) {
  var task = this,
    result = new Future(),
    complete = task._complete;

  if (args) {
    task._args.push.apply(task._args, arguments);
  }

  if (!complete || !complete.__task__) {
    task._complete = function () {
      if (typeof complete === 'function')
        complete.apply(task, task._args);

      if (task.error)
        return result.fulfill(false, task.error);

      result.fulfill(task._args);
    };

    task._complete.__task__ = this;
    task._complete.__orig__ = complete;
  }

  task.resume.async();

  return result;
};

/**
 * Ends the current Task, completing synchronously first if necessary.
 * @expose
 */
Task.prototype.finish = function () {
  var task = this,
    value, error, waiting;

  if (this._finishing === true) {
    value = this._args;
    error = this.error;
    waiting = this._waiting;

    this._finishing = false;
    this._complete.apply(this, value);

    waiting.forEach.bind(waiting, function (cb) {
      if (cb instanceof Future) {
        cb.fulfill(value, error);
      } else if (cb instanceof Task) {
        cb.error = error;
        cb.args(value);
        cb.run();
      } else {
        cb.call(null, value, error);
      }
    }).async();

  } else {
    this._finishing = true;
    this.resume();
  }
};

/**
 * Returns the bound next step in the task flow, if one exists.
 * @protected
 * @return {?Tasklet}
 */
Task.prototype.next = function () {
  var task = this,
    next = task._steps[task._step++];

  return next ? function () {
    return next.apply(task, task._args);
  } : next;
};

/**
 * Execute a single step of the Task.
 * @protected
 */
Task.prototype.resume = function () {
  var task = this,
    next = task.next(),
    pending = 0,
    /**
     * @param {Array.<*>=} args
     * @param {Error=} err
     */
    pendingCb = function (args, err) {
      task.error = err;

      if (task.error)
        return task.finish();

      task.args(args);
      task.resume();
    },
    args;

  if (!next) {
    task._finishing = true;
    return task.finish();
  }

  try {
    args = next();
  } catch (e) {
    pendingCb(args, e);
  }

  if (args instanceof Task) {

    args.run().then(pendingCb);

  } else if (args instanceof Future) {

    args.then(pendingCb);

  } else {

    if (!Array.isArray(args))
      args = [args];

    args.forEach(function (arg, i) {
      var futureCb = function (v, e) {
        args[i] = v;

        if (--pending === 0)
          pendingCb(args, e);
      };

      if (arg instanceof Task) {
        pending += 1;

        arg.run().then(futureCb);
      } else if (arg instanceof Future) {
        pending += 1;

        arg.then(futureCb);
      }
    });

    if (pending === 0) {
      if (this._finishing === true) {
        pendingCb(args);
      } else {
        pendingCb.bind(null, args).async();
      }
    }
  }
};
