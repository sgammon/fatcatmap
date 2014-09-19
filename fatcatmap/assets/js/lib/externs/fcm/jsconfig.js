/**
 * @fileoverview Server-injected application config.
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
