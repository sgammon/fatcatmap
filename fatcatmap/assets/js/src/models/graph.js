/**
 * @fileoverview Fatcatmap graph models.
 *
 * @author  David Rekow <david@momentum.io>,
 *          Sam Gammon <sam@momentum.io>,
 *          Alex Rosner <alex@momentum.io>,
 *          Ian Weisberger <ian@momentum.io>
 *
 * copyright (c) momentum labs, 2014
 */

goog.provide('models.graph');

models.graph = {
  /**
   * @constructor
   * @param {string} key
   * @throws {TypeError} If key is not a string.
   */
  Node: function (key) {
    if (typeof key !== 'string')
      throw new TypeError('Node() expects a string key as the first parameter.');

    /**
     * @expose
     * @type {string}
     */
    this.key = key;
  },

  /**
   * @constructor
   * @param {string} key
   * @throws {TypeError} If key is not a string.
   */
  Edge: function (key) {
    if (typeof key !== 'string')
      throw new TypeError('Edge() expects a string key as the first parameter.');

    /**
     * @expose
     * @type {string}
     */
    this.key = key;
  }
};
