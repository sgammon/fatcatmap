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
var JSConfig = {};

/** @type {boolean} */
JSConfig.pagedata;

/** @type {Object} */
JSConfig.protocol;

/** @type {Object} */
JSConfig.protocol.rpc;

/** @type {boolean} */
JSConfig.protocol.rpc.enabled;

/** @type {boolean} */
JSConfig.protocol.rpc.secure;

/** @type {string} */
JSConfig.protocol.rpc.host;

/** @type {number} */
JSConfig.protocol.rpc.version;

/** @type {Object} */
JSConfig.protocol.realtime;

/** @type {boolean} */
JSConfig.protocol.realtime.enabled;

/** @type {boolean} */
JSConfig.protocol.realtime.secure;

/** @type {string} */
JSConfig.protocol.realtime.host;

/** @type {number} */
JSConfig.protocol.realtime.version;

/** @type {Object} */
JSConfig.session;

/** @type {boolean} */
JSConfig.session.established;

/** @type {Object} */
JSConfig.session.payload;

/** @type {Object} */
JSConfig.agent;

/** @type {Object} */
JSConfig.agent.capabilities;

/** @type {boolean} */
JSConfig.agent.capabilities.webp;

/** @type {boolean} */
JSConfig.agent.capabilities.spdy;

/** @type {boolean} */
JSConfig.agent.capabilities.webm;

/** @type {Array.<Array.<(string|Array.<string>|Object.<string, string>)>>} */
JSConfig.services;

/** @type {Object} */
JSConfig.template;

/** @type {Object.<string, string>} */
JSConfig.template.manifest;
