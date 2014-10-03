/**
 * @fileoverview Server-injected application data.
 *
 * @author  David Rekow <david@momentum.io>,
 *          Sam Gammon <sam@momentum.io>,
 *          Alex Rosner <alex@momentum.io>,
 *          Ian Weisberger <ian@momentum.io>
 * 
 * copyright (c) momentum labs, 2014
 * @externs
 */

/** @typedef {Object} */
var GraphObject = {};

/** @type {Object} */
GraphObject.data;

/** @type {boolean} */
GraphObject.cached;


/** @typedef {Object} */
var GraphQueryOptions = {};

/** @type {number} */
GraphQueryOptions.depth;

/** @type {number} */
GraphQueryOptions.limit;

/** @type {boolean} */
GraphQueryOptions.cached;

/** @type {boolean} */
GraphQueryOptions.indexes;

/** @type {boolean} */
GraphQueryOptions.keys_only;

/** @type {boolean} */
GraphQueryOptions.collections;


/** @typedef {Object} */
var GraphData = {};

/** @type {string} */
GraphData.session;

/** @type {Object} */
GraphData.meta;

/** @type {Array.<string>} */
GraphData.meta.kinds;

/** @type {Array.<number>} */
GraphData.meta.counts;

/** @type {boolean} */
GraphData.meta.cached;

/** @type {GraphQueryOptions} */
GraphData.meta.options;

/** @type {string} */
GraphData.meta.fragment;

/** @type {Object} */
GraphData.data;

/** @type {Array.<string>} */
GraphData.data.keys;

/** @type {Object} */
GraphData.data.indexes;

/** @type {Array.<GraphObject>} */
GraphData.data.objects;

/** @type {Object} */
GraphData.graph;

/** @type {number} */
GraphData.graph.origin;

/** @type {number} */
GraphData.graph.vertices;

/** @type {number} */
GraphData.graph.edges;

/** @type {string} */
GraphData.graph.structure;
