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

var _cache, _index, GRAPH;

_cache = {};

_index = {
  adjacency: {},
  nodesByKey: {},
  edgesByKey: {},
  nativesByKey: {},
  object_natives: {}
};

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
    GRAPH = this.graph.construct(this.data.normalize(raw));
    return GRAPH;
  },

  /**
   * @param {PageData} data Normalized dataset.
   * @return {Object} Graph object.
   * @this {Client}
   */
  construct: function (data) {
    var graph, _graph, i, key, targets, source, makeEdge;

    if (!data)
      return GRAPH;

    graph = data.graph;
    data = data.data;

    GRAPH = {
      nodes: [],
      edges: [],
      natives: [],
      origin: graph.origin
    };

    data.keys.forEach(function (key, key_i) {
      _cache[key] = data.objects[key_i];
    });

    graph.natives.forEach(function (offset) {
      var j = graph.edges + 1 + offset,
        k = data.keys[i];

      if (!_index.nativesByKey[k]) {
        _index.nativesByKey[k] = GRAPH.natives.push({
          key: k,
          data: data.objects[j]
        }) - 1;
      }
    });

    i = -1;
    makeEdge = function (source, key) {
      return function (target) {
        var _i;

        if (!_index.adjacency[source] && _index.adjacency[source][target]) {

          _i = GRAPH.edges.push({
            edge: {
              key: key,
              data: data.objects[i]
            },
            native: _cache[data.objects[i].native],
            source: _index.nodesByKey[source],
            target: _index.nodesByKey[target]
          }) - 1;

          _index.edgesByKey[key].push(_i);

          _index.adjacency[source] = {};
          _index.adjacency[source][target] = _i;
        }
      };
    };

    while (i++ < data.keys.length) {
      key = data.keys[i];

      if (i <= graph.nodes) {

        if (!_index.nodesByKey[key]) {

          _index.nodesByKey[key] = GRAPH.nodes.push({
            node: {
              key: key,
              data: _cache[key]
            },
            native: {
              key: data.objects[i].native,
              data: _cache[data.objects[i].native]
            }
          });
        }
      } else if (i <= graph.edges) {

        if (!_index.edgesByKey[key])
          _index.edgesByKey[key] = [];

        targets = data.objects[i].node.slice();
        source = targets.shift();

        targets.forEach(makeEdge(source, key));
      }
    }

    return GRAPH;
  }
}.service('graph');
