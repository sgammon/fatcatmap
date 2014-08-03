/**
 * @fileoverview Fatcatmap graphing service.
 *
 * @author  David Rekow <david@momentum.io>,
 *          Sam Gammon <sam@momentum.io>,
 *          Alex Rosner <alex@momentum.io>,
 *          Ian Weisberger <ian@momentum.io>
 * 
 * copyright (c) momentum labs, 2014
 */

goog.require('services');
goog.require('services.data');

goog.provide('services.graph');

var _graph = {};

/**
 * @expose
 */
services.graph = /** @lends {Client.prototype.graph} */ {
  /**
   * @param {Object|PageData} raw Raw data to initialize with.
   * @return {Object} Constructed graph object.
   * @this {Client}
   */
  init: function (raw) {
    _graph = this.graph.construct(this.data.normalize(raw));
  },

  /**
   * @param {PageData} data Normalized dataset.
   * @return {Object} Graph object.
   * @this {Client}
   */
  construct: function (data) {
    var graph;

    if (!data)
      return _graph;

    graph.origin = data.graph.origin;

    return data;
  }
}.service('graph');
