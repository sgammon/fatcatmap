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
   * @expose
   * @type {JSContext|*}
   */
  context: JSON.parse($('#js-context').textContent || '{}'),

  /**
   * @expose
   * @type {PageData|*}
   */
  data: JSON.parse($('#js-data').textContent || '{}')
};