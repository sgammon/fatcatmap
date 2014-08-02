/**
 * @fileoverview Core task runtime.
 *
 * @author  David Rekow <david@momentum.io>,
 *          Sam Gammon <sam@momentum.io>,
 *          Alex Rosner <alex@momentum.io>,
 *          Ian Weisberger <ian@momentum.io>
 * 
 * copyright (c) momentum labs, 2014
 */

goog.require('$');
goog.require('services');

goog.provide('task');

var TASKS, _insertTask, _runTask;

TASKS = [];
TASKS.active = false;


_runTask = function () {
  var now = Date.now(),
    task;

  TASKS.active = true;

  if (TASKS.length && TASKS[TASKS.length].delay < now) {
    task = TASKS.pop();
    task.fn.apply(null, task.args);

    if (!TASKS.length)
      TASKS.active = false;

    return;
  }

  setTimeout(_runTask, TASKS[TASKS.length].delay - now);
};


/**
 * @param {Object.<{
 *   fn: function(this: Client),
 *   delay: number,
 *   args: Array.<*>
 * }} task
 */
_insertTask = function (task) {
  var lo = 0,
    hi = TASKS.length,
    mid;

  while (lo < hi) {
    mid = Math.floor((lo + hi) / 2);
    if (task.delay > TASKS[mid].delay) {  // store in reverse delay order
      hi = mid;
    } else {
      lo = mid + 1;
    }
  }

  TASKS.splice(lo, 0, task);

  if (TASKS.active === false)
    _runTask();
};


Object.defineProperty(Function.prototype, 'task', {
  /**
   * @expose
   * @param {number} delay
   * @param {...*} var_args
   */
  value: /** @this {Function} */ function (delay, var_args) {
    var_args = var_args ? toArray(arguments) : [];

    _insertTask({
      delay: Date.now() + (delay * 1000),
      fn: this.client(),
      args: var_args
    });
  }
});
