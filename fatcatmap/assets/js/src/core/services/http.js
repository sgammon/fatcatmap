/**
 * @fileoverview Lightweight service wrapper for XMLHttpRequest.
 *
 * @author  David Rekow <david@momentum.io>,
 *          Sam Gammon <sam@momentum.io>,
 *          Alex Rosner <alex@momentum.io>,
 *          Ian Weisberger <ian@momentum.io>
 * 
 * copyright (c) momentum labs, 2014
 */

goog.require('async');
goog.require('urlutil');

goog.provide('services.http');

/**
 * @typedef {{
 *    url: string,
 *    headers: ?Object.<string, string>,
 *    params: ?Object.<string, string>,
 *    data: ?(string|Object)
 * }}
 */
var Request;

/**
 * @typedef {{
 *    data: *,
 *    headers: Object.<string, string>
 * }}
 */
var Response;

var splitter, prepareRequest, dispatch, parseResponse;

splitter = /^([^:]+):\s*/;


/**
 * @param {string} method
 * @param {Request} request
 * @param {CallbackMap=} handlers
 * @return {XMLHttpRequest}
 */
prepareRequest = function (method, request, handlers) {
  var xhr = new XMLHttpRequest(),
    url, headers;

  if (request.params) {
    url = urlutil.addParams(request.url, request.params);
  } else {
    url = request.url;
  }

  xhr.open(method.toUpperCase(), url, !!handlers);

  if (request.headers) {
    headers = request.headers;
    for (var k in headers) {
      if (headers.hasOwnProperty(k))
        xhr.setRequestHeader(k, headers[k]);
    }
  }

  xhr.data = request.data;

  if (handlers) {
    xhr.onerror = handlers.error;
    xhr.onloadend = function () {
      xhr.responseJSON = parseResponse(xhr);
      handlers.success(xhr.responseJSON);
    };
  } else {
    xhr.onerror = function (e) {
      /**
       * @expose
       */
      xhr.error = e;
    };
    xhr.onloadend = function () {
      /**
       * @expose
       */
      xhr.responseJSON = parseResponse(xhr);
    };
  }

  return xhr;
};

/**
 * @param {string} method
 * @param {Request} request
 * @param {CallbackMap=} handlers
 * @return {XMLHttpRequest}
 */
dispatch = function (method, request, handlers) {
  var data = typeof request.data === 'object' ? JSON.stringify(request.data) :
    typeof request.data === 'string' ? request.data :
      request.data == null ? null : '' + request.data,

    req = prepareRequest(method, request, handlers);
  req.send(data);
  return req;
};

/**
 * @param {XMLHttpRequest} response
 * @return {Response}
 */
parseResponse = function (response) {
  var resp = {},
    headers = response.getAllResponseHeaders().split('\n'),
    chunks;

  try {
    resp.data = JSON.parse(response.responseText);
  } catch (e) {
    resp.data = response.responseText || '';
  }

  resp.headers = {};

  for (var i = 0; i < headers.length; i++) {
    if (!headers[i])
      continue;

    chunks = headers[i].split(splitter);
    resp.headers[chunks[1]] = chunks[2];
  }

  return resp;
};

/**
 * @expose
 */
services.http = {
  /**
   * @param {Request} request
   * @param {CallbackMap=} handlers If not passed, executes synchronously.
   * @return {XMLHttpRequest|Response} XHR, or response if no handlers were passed. 
   */
  get: function (request, handlers) {
    return dispatch('GET', request, handlers);
  },

  /**
   * @param {Request} request
   * @param {CallbackMap=} handlers If not passed, executes synchronously.
   * @return {XMLHttpRequest|Response} XHR, or response if no handlers were passed. 
   */
  delete: function (request, handlers) {
    return dispatch('DELETE', request, handlers);
  },

  /**
   * @param {Request} request
   * @param {CallbackMap=} handlers If not passed, executes synchronously.
   * @return {XMLHttpRequest|Response} XHR, or response if no handlers were passed.
   */
  head: function (request, handlers) {
    return dispatch('HEAD', request, handlers);
  },

  /**
   * @param {Request} request
   * @param {CallbackMap=} handlers If not passed, executes synchronously.
   * @return {XMLHttpRequest|Response} XHR, or response if no handlers were passed.
   * @expose
   */
  post: function (request, handlers) {
    return dispatch('POST', request, handlers);
  },

  /**
   * @param {Request} request
   * @param {CallbackMap=} handlers If not passed, executes synchronously.
   * @return {XMLHttpRequest|Response} XHR, or response if no handlers were passed.
   */
  put: function (request, handlers) {
    return dispatch('PUT', request, handlers);
  },

  /**
   * @param {Request} request
   * @param {CallbackMap=} handlers If not passed, executes synchronously.
   * @return {XMLHttpRequest|Response} XHR, or response if no handlers were passed.
   * @expose
   */
  patch: function (request, handlers) {
    return dispatch('PATCH', request, handlers);
  },

  /**
   * @param {Request} request
   * @param {CallbackMap=} handlers If not passed, executes synchronously.
   * @return {XMLHttpRequest|Response} XHR, or response if no handlers were passed.
   */
  options: function (request, handlers) {
    return dispatch('OPTIONS', request, handlers);
  }
};
