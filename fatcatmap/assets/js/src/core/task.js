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

goog.require('$');
goog.require('async');
goog.require('future');

goog.provide('task');

var TaskStep, TaskContinuation, Task;

/**
 * @typedef {function(this: Task, ...[*]): ?(Array.<*>|Task|Future)}
 */
TaskStep;

/**
 * Represents an intermediate step in a Task control flow declaration.
 * @constructor
 * @param {Task} task
 */
TaskContinuation = function (task) {
  /**
   * @expose
   * @param {TaskStep} fn
   * @return {TaskContinuation}
   */
  this.then = function (fn) {
    task._steps.push(fn);
    return this;
  };

  /**
   * @expose
   * @param {TaskStep} fn
   * @return {Task}
   */
  this.last = function (fn) {
    task._complete.push(fn);
    return task;
  };
};

/**
 * @constructor
 */
Task = function () {

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
   * @type {Array.<TaskStep>}
   */
  this._steps = [];


  /**
   * @protected
   * @type {Array.<TaskStep>}
   */
  this._complete = [];

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
};

/**
 * Resets the Task execution state.
 * @expose
 * @return {Task}
 */
Task.prototype.reset = function () {
  this.error = null;
  this._args = [];
  this._step = 0;
  this._finishing = false;
  return this;
};

/**
 * Resets the Task state completely.
 * @expose
 * @return {Task}
 */
Task.prototype.reinit = function () {
  Task.call(this);
  return this;
};

/**
 * Sets the initial step in the task flow.
 * @expose
 * @param {TaskStep} fn
 * @return {TaskContinuation}
 * @throws {Error} If <code>first</code> has already been called.
 */
Task.prototype.first = function (fn) {
  if (this._steps.length)
    throw new Error('Task.first() can only be called once.');

  return new TaskContinuation(this).then(fn);
};

/**
 * Sets the initial argument set.
 * @expose
 * @param {...[*]} args
 */
Task.prototype.args = function (args) {
  this._args = args ? 
    arguments[1] ? Array.prototype.slice.call(arguments) :
    Array.isArray(args) ? args : [args] : this._args;
};

/**
 * Schedules the initial task step and stores any passed arguments to execute with.
 * @expose
 * @param {...[*]} args Arguments to pass in addition to any partially-applied args.
 */
Task.prototype.run = function (args) {
  var task = this,
    result = new Future(),
    _args;

  if (args) {
    task._args.push.apply(task._args, toArray(arguments));
  }

  task._complete.push(function () {
    if (task.error)
      return result.fulfill(false, task.error);

    result.fulfill(task._args);
  });

  (function () { task.resume(); }).async();

  return result;
};

/**
 * Ends the current Task, completing synchronously first if necessary.
 * @expose
 */
Task.prototype.finish = function () {
  var task = this;

  if (task._finishing === true) {
    task._finishing = false;
    task._complete.forEach(function (fn) {
      fn.apply(task, task._args);
    });
  } else {
    task._finishing = true;
    task.resume();
  }
};

/**
 * Returns the bound next step in the task flow, if one exists.
 * @protected
 * @return {?TaskStep}
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

  args = next() || [];

  if (args instanceof Task) {

    args.run().then(pendingCb);

  } else if (args instanceof Future) {

    args.then(pendingCb);

  } else {

    args.forEach(function (arg, i) {
      if (arg instanceof Task) {
        pending += 1;

        arg._complete.push(function () {
          args[i] = this._args;
          
          if (--pending === 0)
            pendingCb(args, this.error);
        });
      } else if (arg instanceof Future) {
        pending += 1;

        arg.then(function (v, e) {
          args[i] = v;

          if (--pending === 0)
            pendingCb(args, e);
        });
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

/** @expose */
window.Task = Task;
