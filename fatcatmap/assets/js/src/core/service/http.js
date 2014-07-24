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

goog.provide('service.http');

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
 *    data: (Object|string),
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
  } else if (typeof request !== 'string') {
    url = request.url;
  } else {
    url = request;
  }

  xhr.open(method.toUpperCase(), url, !!handlers);

  if (request.headers) {
    headers = request.headers;
    for (var k in headers) {
      if (headers.hasOwnProperty(k)) {
        xhr.setRequestHeader(k, headers[k]);
      }
    }
  }

  if (handlers) {
    xhr.onerror = handlers.error;
    xhr.onloadend = function () {
      this.responseJSON = parseResponse(this);
      handlers.success(this.responseJSON);
    };
  } else {
    xhr.onerror = function (e) {
      /**
       * @expose
       */
      this.error = e;
    };
    xhr.onloadend = function () {
      /**
       * @expose
       */
      this.responseJSON = parseResponse(this);
    };
  }

  return xhr;
};

/**
 * @param {string} method
 * @param {Request} request
 * @param {CallbackMap=} handlers
 * @return {XMLHttpRequest|Response}
 */
dispatch = function (method, request, handlers) {
  var data = typeof request.data === 'object' ? JSON.stringify(request.data) :
    typeof request.data === 'string' ? request.data :
      request.data == null ? null : '' + request.data;
  request = prepareRequest(method, request, handlers);
  request.send(data);
  return request;
};

/**
 * @param {string} response
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
    if (!headers[i]) {
      continue;
    }
    chunks = headers[i].split(splitter);
    resp.headers[chunks[1]] = chunks[2];
  }

  return resp;
};

service.http = {
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
