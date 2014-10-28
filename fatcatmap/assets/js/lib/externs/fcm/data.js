/**
 * @fileoverview Data types.
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
var DataKey = {};

/** @type {string} */
DataKey.encoded;

/** @type {number} */
DataKey.timestamp;


/** @typedef {Object} */
var DataKeyset = {};

/** @type {string} */
DataKeyset.fragment;

/** @type {Array.<DataKey>} */
DataKeyset.data;


/** @typedef {Object} */
var DataObject = {};

/** @type {Object} */
DataObject.data;

/** @type {boolean} */
DataObject.cached;

/** @type {Object.<string, Object>} */
DataObject.descriptors;


/** @typedef {Object} */
var DataQueryOptions = {};

/** @type {boolean} */
DataQueryOptions.cached;

/** @type {boolean} */
DataQueryOptions.collections;


/** @typedef {Object} */
var DataQuery = {};

/** @type {?string} */
DataQuery.session;

/** @type {Array.<string>} */
DataQuery.keys;

/** @type {?DataKeyset} */
DataQuery.held;

/** @type {DataQueryOptions} */
DataQuery.options;


/** @typedef {Object} */
var Data = {};

/** @type {string} */
Data.session;

/** @type {number} */
Data.count;

/** @type {number} */
Data.errors;

/** @type {DataKeyset} */
Data.keys;

/** @type {Array.<DataObject>} */
Data.objects;
