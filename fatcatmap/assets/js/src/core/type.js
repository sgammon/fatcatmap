/**
 * @fileoverview Normalized typechecking.
 *
 * @author  David Rekow <david@momentum.io>,
 *          Sam Gammon <sam@momentum.io>,
 *          Alex Rosner <alex@momentum.io>,
 *          Ian Weisberger <ian@momentum.io>
 *
 * copyright (c) momentum labs, 2014
 */

goog.provide('type');

/**
 * @param {*} obj
 * @return {string}
 */
var type = (function () {
  var OBJ = {},
    str = function (x) {
      return OBJ.toString.call(x);
    };

  return function (obj) {
    return str(obj).split(' ').slice(0, -1).toLowerCase();
  };
})();
