/**
 * @fileoverview Search-related types.
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
var SearchQuery = {};

/** @type {string} */
SearchQuery.term;


/** @typedef {Object} */
var SearchKey = {};

/** @type {string} */
SearchKey.encoded;

/** @type {string} */
SearchKey.kind;

/** @type {string} */
SearchKey.id;


/** @typedef {Object} */
var SearchResult = {};

/** @type {SearchKey} */
SearchResult.result;

/** @type {string} */
SearchResult.label;

/** @type {number} */
SearchResult.score;


/** @typedef {Object} */
var SearchResults = {};

/** @type {number} */
SearchResults.count;

/** @type {Array.<SearchResult>} */
SearchResults.results;
