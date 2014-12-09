/**
 * @fileoverview Catnip configuration scraper.
 *
 * @author  David Rekow <david@momentum.io>,
 *          Sam Gammon <sam@momentum.io>,
 *          Alex Rosner <alex@momentum.io>,
 *          Ian Weisberger <ian@momentum.io>
 *
 * copyright (c) momentum labs, 2014
 */

goog.require('$');

goog.provide('config');

var config = {
  /**
   * @type {JSContext}
   */
  context: $('#js-context') ? JSON.parse($('#js-context').textContent) : null,

  /**
   * @type {GraphData}
   */
  data: $('#js-data') ? JSON.parse($('#js-data').textContent) : null
};