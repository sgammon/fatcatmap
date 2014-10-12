/**
 * @fileoverview Array utility methods.
 *
 * @author  David Rekow <david@momentum.io>,
 *          Sam Gammon <sam@momentum.io>,
 *          Alex Rosner <alex@momentum.io>,
 *          Ian Weisberger <ian@momentum.io>
 * 
 * copyright (c) momentum labs, 2014
 */

goog.provide('util.array');

util.array = {
  /**
   * @param {Object.<number,*>} list List of items to convert to array.
   * @return {Array.<*>}
   */
  toArray: function (list) {
    var arr = [], i;
    for (i = 0; i < list.length; arr.push(list[i++])) {}
    return arr;
  },

  /**
   * @param {...[*]} items Items to normalize to an array of non-arrays.
   * @return {Array.<*>}
   */
  normalize: function (items) {
    return items ? arguments[1] ? util.array.toArray(arguments) :
      Array.isArray(items) ? items : [items] : [];
  },

  /**
   * @param {...[Array.<*>]} arrays Arrays to flatten into a single array.
   * @param {boolean=} deep If true, will unpack all arrays recursively.
   * @return {Array.<*>}
   */
  flatten: function (arrays, deep) {
    var flattened = [],
      i, array;

    if (arguments[1])
      arrays = util.array.normalize(arguments);

    for (i = 0; i < arrays.length; i++) {
      array = arrays[i];

      if (!Array.isArray(array)) {
        flattened.push(array);
        continue;
      }

      flattened.push.apply(flattened, deep === true ? util.array.flatten(array, deep) : array);
    }

    return flattened;
  }
};
