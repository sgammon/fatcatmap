/**
 * @fileoverview Lightweight wrapper for XMLHttpRequest.
 *
 * @author  David Rekow <david@momentum.io>,
 *          Sam Gammon <sam@momentum.io>,
 *          Alex Rosner <alex@momentum.io>,
 *          Ian Weisberger <ian@momentum.io>
 * 
 * copyright (c) momentum labs, 2014
 */

goog.require('async');

goog.provide('http');

/**
 * @typedef {{
 *    url: string,
 *    headers: ?Object.<string, string>,
 *    params: ?Object.<string, string>,
 *    data: ?(string|Object)
 * }}
 */
var Request;

var http = (function () {
  var encode, parseData, appendParams, prepareRequest;

  encode = encodeURIComponent;

  /**
   * @param {string} response
   * @return {{data: string}}
   */
  parseData = function (response) {
    var data = {};
    try {
      data.data = JSON.parse(response);
    } catch (e) {
      data.data = response || '';
    }
    return data;
  };

  /**
   * @param {string} url
   * @param {Object.<string, string>} params
   * @return {string}
   */
  appendParams = function (url, params) {
    url = url.slice();
    if (url.indexOf('?') === -1) {
      url += '?';
    }
    for (var k in params) {
      if (params.hasOwnProperty(k)) {
        url += '&' + encode(k) + '=' + encode(params[k]);
      }
    }
    return url;
  };

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
      url = appendParams(request.url, request.params);
    } else {
      url = request.url;
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
      xhr.onload = function () {
        handlers.success(parseData(this.responseText));
      };
    }

    return xhr;
  };

  return /** @lends {http} */{

    /**
     * @param {Request} request
     * @param {CallbackMap=} handlers If not passed, executes synchronously.
     * @return {XMLHttpRequest|string} XHR, or response if no handlers were passed. 
     */
    get: function (request, handlers) {
      var xhr = prepareRequest('GET', request, handlers);
      xhr.send();
      return handlers ? xhr : parseData(xhr.responseText);
    },

    /**
     * @param {Request} request
     * @param {CallbackMap=} handlers If not passed, executes synchronously.
     * @return {XMLHttpRequest|string} XHR, or response if no handlers were passed. 
     */
    del: function (request, handlers) {
      var xhr = prepareRequest('DELETE', request, handlers);
      xhr.send();
      return handlers ? xhr : parseData(xhr.responseText);
    },

    /**
     * @param {Request} request
     * @param {CallbackMap=} handlers If not passed, executes synchronously.
     * @return {XMLHttpRequest|*} Response, if no handlers were passed, or XHR.
     */
    post: function (request, handlers) {
      var xhr = prepareRequest('POST', request, handlers),
        data = typeof request.data !== 'string' ?
          JSON.stringify(request.data) :
          request.data;
      xhr.send(data);
      return handlers ? xhr : parseData(xhr.responseText);
    },

    /**
     * @param {Request} request
     * @param {CallbackMap=} handlers If not passed, executes synchronously.
     * @return {XMLHttpRequest|*} Response, if no handlers were passed, or XHR.
     */
    put: function (request, handlers) {
      var xhr = prepareRequest('PUT', request, handlers),
        data = typeof request.data !== 'string' ?
          JSON.stringify(request.data) :
          request.data;
      xhr.send(data);
      return handlers ? xhr : parseData(xhr.responseText);
    },

    /**
     * @param {Request} request
     * @param {CallbackMap=} handlers If not passed, executes synchronously.
     * @return {XMLHttpRequest|*} Response, if no handlers were passed, or XHR.
     */
    patch: function (request, handlers) {
      var xhr = prepareRequest('PATCH', request, handlers),
        data = typeof request.data !== 'string' ?
          JSON.stringify(request.data) :
          request.data;
      xhr.send(data);
      return handlers ? xhr : parseData(xhr.responseText);
    }
  };
})();