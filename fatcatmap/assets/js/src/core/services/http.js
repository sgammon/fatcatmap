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

goog.require('util.url');
goog.require('async.future');
goog.require('service');

goog.provide('services.http');

var _prepareRequest, _dispatchRequest, _parseResponse;

/**
 * @param {string} method
 * @param {Request} request
 * @param {Future} response
 * @param {boolean} async
 * @return {XMLHttpRequest}
 */
_prepareRequest = function (method, request, response, async) {
  var xhr = new XMLHttpRequest(),
    url, headers;

  if (request.params) {
    url = util.url.addParams(request.url, request.params);
  } else {
    url = request.url;
  }

  xhr.open(method.toUpperCase(), url, !!async);

  if (request.headers) {
    headers = request.headers;
    for (var k in headers) {
      if (headers.hasOwnProperty(k))
        xhr.setRequestHeader(k, headers[k]);
    }
  }

  xhr.data = request.data;

  xhr.onerror = function (e) {
    /**
     * @expose
     */
    xhr.error = e;

    response.fulfill(false, e);
  };

  xhr.onloadend = function () {
    /**
     * @expose
     */
    xhr.responseJSON = _parseResponse(xhr);

    response.fulfill(xhr.responseJSON);
  };

  return xhr;
};

/**
 * @param {string} method
 * @param {Request} request
 * @param {PipelinedCallback} handler
 * @return {Future|Response}
 */
_dispatchRequest = function (method, request, handler) {
  /*jshint eqnull:true */
  var response = new Future(),
    data = typeof request.data === 'object' ? JSON.stringify(request.data) :
      typeof request.data === 'string' ? request.data :
      request.data == null ? null : '' + request.data;

  request = _prepareRequest(method, request, response, !!handler);

  request.send(data);

  if (handler) {
    response = response.then(handler);
  } else {
    response = request.responseJSON;
  }

  return response;
};

/**
 * @param {XMLHttpRequest} response
 * @return {Response}
 */
_parseResponse = function (response) {
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

    chunks = headers[i].split(/^([^:]+):\s*/);
    resp.headers[chunks[1]] = chunks[2];
  }

  return resp;
};

/**
 * @expose
 */
services.http = /** @lends {ServiceContext.prototype.http} */{
  /**
   * @param {Request} request
   * @param {PipelinedCallback=} handler If not passed, executes synchronously.
   * @return {Future|Response} Future response, or response if no handler was passed. 
   */
  get: function (request, handler) {
    return _dispatchRequest('GET', request, handler);
  },

  /**
   * @param {Request} request
   * @param {PipelinedCallback=} handler If not passed, executes synchronously.
   * @return {Future|Response} Future response, or response if no handler was passed. 
   */
  delete: function (request, handler) {
    return _dispatchRequest('DELETE', request, handler);
  },

  /**
   * @param {Request} request
   * @param {PipelinedCallback=} handler If not passed, executes synchronously.
   * @return {Future|Response} Future response, or response if no handler was passed.
   */
  head: function (request, handler) {
    return _dispatchRequest('HEAD', request, handler);
  },

  /**
   * @param {Request} request
   * @param {PipelinedCallback=} handler If not passed, executes synchronously.
   * @return {Future|Response} Future response, or response if no handler was passed.
   */
  post: function (request, handler) {
    return _dispatchRequest('POST', request, handler);
  },

  /**
   * @param {Request} request
   * @param {PipelinedCallback=} handler If not passed, executes synchronously.
   * @return {Future|Response} Future response, or response if no handler was passed.
   */
  put: function (request, handler) {
    return _dispatchRequest('PUT', request, handler);
  },

  /**
   * @param {Request} request
   * @param {PipelinedCallback=} handler If not passed, executes synchronously.
   * @return {Future|Response} Future response, or response if no handler was passed.
   */
  patch: function (request, handler) {
    return _dispatchRequest('PATCH', request, handler);
  },

  /**
   * @param {Request} request
   * @param {PipelinedCallback=} handler If not passed, executes synchronously.
   * @return {Future|Response} Future response, or response if no handler was passed.
   */
  options: function (request, handler) {
    return _dispatchRequest('OPTIONS', request, handler);
  }
}.service('http');
