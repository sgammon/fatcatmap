/**
 * @fileoverview Document query API.
 *
 * @author  David Rekow <david@momentum.io>,
 *          Sam Gammon <sam@momentum.io>,
 *          Alex Rosner <alex@momentum.io>,
 *          Ian Weisberger <ian@momentum.io>
 *
 * copyright (c) momentum labs, 2014
 */

goog.require('util.array');

goog.provide('$');

/**
 * @param {string|Node} query CSS selector.
 * @param {Node=} bound
 * @return {(Node|Array.<Node>|string)} Found elements.
 * @throws {TypeError} If query is not an element or string.
 */
var $ = function (query, bound) {
  if (query && query.querySelector)
    return query;

  bound = bound || document;

  if (typeof query === 'string') {
    if (query.charAt(0) === '#')
      return document.getElementById(query.slice(1));

    return util.array.toArray(bound.querySelectorAll(query));
  }
  throw new TypeError('Invalid document query string.');
};

/**
 * @expose
 */
window.$ = $;
