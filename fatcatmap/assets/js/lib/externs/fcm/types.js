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

/**
 * @typedef {Object.<{
 *    url: string,
 *    method: ?string,
 *    headers: ?Object.<string, string>,
 *    params: ?Object.<string, string>,
 *    args: ?Object.<string, string>,
 *    data: ?(string|Object)
 * }>}
 */
var Request;

/**
 * @typedef {Object.<{
 *    data: *,
 *    headers: Object.<string, string>
 * }>}
 */
var Response;

/**
 * Represents an asynchronous callback object.
 * @typedef {Object.<{
 *    success: function(Object),
 *    error: function(Error)
 * }>}
 */
var CallbackMap;

/**
 * Represents a structured message to be passed.
 * @typedef {Object.<{
 *    content: *,
 *    meta: ?Object
 * }>}
 */
var Message;

/**
 * Represents a messaging callback object.
 * @typedef {Object.<{
 *    message: function(Message),
 *    error: function(Error)
 * }>}
 */
var MessageCallbackMap;

/**
 * Represents a pipelined callback.
 * @typedef {function(*=, Error=)}
 */
var PipelinedCallback;