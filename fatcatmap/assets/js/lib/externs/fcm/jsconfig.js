/**
 * @fileoverview Application type definitions.
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
var JSContext = {};

/** @type {boolean} */
JSContext.pagedata;

/** @type {Object} */
JSContext.protocol;

/** @type {Object} */
JSContext.protocol.rpc;

/** @type {boolean} */
JSContext.protocol.rpc.enabled;

/** @type {boolean} */
JSContext.protocol.rpc.secure;

/** @type {string} */
JSContext.protocol.rpc.host;

/** @type {number} */
JSContext.protocol.rpc.version;

/** @type {Object} */
JSContext.protocol.realtime;

/** @type {boolean} */
JSContext.protocol.realtime.enabled;

/** @type {boolean} */
JSContext.protocol.realtime.secure;

/** @type {string} */
JSContext.protocol.realtime.host;

/** @type {number} */
JSContext.protocol.realtime.version;

/** @type {Object} */
JSContext.session;

/** @type {boolean} */
JSContext.session.established;

/** @type {Object} */
JSContext.session.payload;

/** @type {Object} */
JSContext.agent;

/** @type {Object} */
JSContext.agent.capabilities;

/** @type {boolean} */
JSContext.agent.capabilities.webp;

/** @type {boolean} */
JSContext.agent.capabilities.spdy;

/** @type {boolean} */
JSContext.agent.capabilities.webm;

/** @type {Array.<Array.<(string|Array.<string>|Object.<string, string>)>>} */
JSContext.services;

/** @type {Object} */
JSContext.template;

/** @type {Object.<string, string>} */
JSContext.template.manifest;


/** @typedef {Object} */
var PageData = {};

/** @type {Object} */
PageData.meta;

/** @type {Array.<number>} */
PageData.meta.counts;

/** @type {Array.<number>} */
PageData.meta.errors;

/** @type {boolean} */
PageData.meta.natives;

/** @type {Object} */
PageData.meta.options;

/** @type {number} */
PageData.meta.options.depth;

/** @type {number} */
PageData.meta.options.limit;

/** @type {Object} */
PageData.meta.kinds;

/** @type {Array.<string>} */
PageData.meta.kinds.node;

/** @type {Array.<string>} */
PageData.meta.kinds.edge;

/** @type {Object} */
PageData.data;

/** @type {Array.<string>} */
PageData.data.keys;

/** @type {Array.<Object>} */
PageData.data.objects;

/** @type {Object} */
PageData.data.index;

/** @type {Array.<Array.<number>>} */
PageData.data.index.node_edges;

/** @type {Array.<Array.<number>>} */
PageData.data.index.object_natives;

/** @type {Array.<Array.<number>>} */
PageData.data.index.map;

/** @type {Object} */
PageData.graph;

/** @type {number} */
PageData.graph.nodes;

/** @type {number} */
PageData.graph.edges;

/** @type {number} */
PageData.graph.natives;

/** @type {number} */
PageData.graph.origin;
