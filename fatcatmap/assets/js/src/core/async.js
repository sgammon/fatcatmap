/**
 * @fileoverview Async utilities.
 *
 * @author  David Rekow <david@momentum.io>,
 *          Sam Gammon <sam@momentum.io>,
 *          Alex Rosner <alex@momentum.io>,
 *          Ian Weisberger <ian@momentum.io>
 * 
 * copyright (c) momentum labs, 2014
 */

goog.provide('async');


/**
 * @typedef {{
 *    success: function(Object),
 *    error: function(Error)
 * }}
 */
var CallbackMap;
