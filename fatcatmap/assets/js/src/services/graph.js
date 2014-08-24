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

var _graphCache, _graphIndex, GRAPH;

_graphCache = {};

_graphIndex = {
  adjacency: {},
  nodesByKey: {},
  edgesByKey: {}
};

/**
 * @expose
 */
services.graph = /** @lends {Client.prototype.graph} */ {
  /**
   * @param {Object|PageData} data Graph data to initialize with.
   * @return {Object} Constructed graph object.
   * @this {Client}
   */
  init: function (data) {
    GRAPH = this.graph.construct(data.graph, data.data);
    return GRAPH;
  },

  /**
   * @param {Object} graph Graph index.
   * @param {Object} data Graph data.
   * @return {Object} Graph object.
   * @this {Client}
   */
  construct: function (graph, data) {

    if (!graph)
      return GRAPH;

    GRAPH = {
      nodes: [],
      edges: [],
      natives: [],
      origin: graph.origin,
      origin_key: data.keys[graph.origin]
    };

    return this.graph.add(graph, data);
  },

  /**
   * @param {Object} graph Graph index.
   * @param {Object} data Graph data.
   * @return {Object} Graph object.
   * @this {Client}
   */
  add: function (graph, data) {
    var makeEdge, i, keys, key, node, nativeKey, native, targets, source;

    makeEdge = function (source, key) {
      return function (target) {
        var _i;

        if (!_graphIndex.adjacency[source] || !_graphIndex.adjacency[source][target]) {
          if (_graphIndex.nodesByKey[source] == null ||
              _graphIndex.nodesByKey[target] == null) {
            debugger;
          }
          _i = GRAPH.edges.push({
            'key': key,
            'source': _graphIndex.nodesByKey[source],
            'target': _graphIndex.nodesByKey[target]
          }) - 1;

          _graphIndex.edgesByKey[key].push(_i);

          _graphIndex.adjacency[source] = {};
          _graphIndex.adjacency[source][target] = _i;
        }
      };
    };

    i = 0;
    keys = data.keys;

    while (i < keys.length) {
      key = keys[i];

      if (i <= graph.nodes) {

        if (!_graphIndex.nodesByKey[key]) {

          node = {
            key: key,
            classes: ['node']
          };

          nativeKey = data.objects[i].native;
          native = data.objects[keys.indexOf(nativeKey)];

          if (native.govtrack_id) {
            node.classes.push('legislator');
            node.classes.push(native.gender === 'M' ? 'male' : 'female');
            node.classes.push(Math.ceil(Math.random() * 100) % 2 ? 'democrat' : 'republican');
            if (Math.random() < 0.1869)
              node.classes.push('senate');
          } else {
            node.classes.push('contributor');
            node.classes.push(native.contributor_type == 'C' ? 'corporate' : 'individual');
          }

          _graphIndex.nodesByKey[key] = GRAPH.nodes.push(node) - 1;
        }
      } else if (i <= graph.edges) {

        if (!_graphIndex.edgesByKey[key])
          _graphIndex.edgesByKey[key] = [];

        targets = data.objects[i].node.slice();
        source = targets.shift();

        targets.forEach(makeEdge(source, key));
      }
      i++;
    }

    return this.graph.get();
  },

  /**
   * @return {Object} Graph object.
   */
  get: function () {
    return GRAPH;
  }
}.service('graph');
