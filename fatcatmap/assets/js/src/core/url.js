/**
 * @fileoverview Thin URL utility.
 *
 * @author  David Rekow <david@momentum.io>,
 *          Sam Gammon <sam@momentum.io>,
 *          Alex Rosner <alex@momentum.io>,
 *          Ian Weisberger <ian@momentum.io>
 * 
 * copyright (c) momentum labs, 2014
 */

goog.provide('urlutil');

var urlutil = {

  /**
   * Encodes & appends a param object to a url.
   * @param {string} url
   * @param {Object.<string, string>} params
   * @return {string}
   */
  addParams: function (url, params) {
    var needsAmp = true;
    if (url.indexOf('?') === -1) {
      url += '?';
      needsAmp = false;
    }

    for (var k in params) {
      if (params.hasOwnProperty(k)) {
        if (needsAmp === true) {
          url += '&';
        } else {
          needsAmp = true;
        }
        url += encodeURIComponent(k) + '=' + encodeURIComponent(params[k]);
      }
    }

    return url;
  },

  /**
   * Parses & inflates a query param object from a url.
   * @param {string} url
   * @return {Object.<string, string>} params
   */
  parseParams: function (url) {
    var params = {},
      tuples = url.split('?').pop().split('&'),
      tuple, v;

    for (var i = 0; i < tuples.length; i++) {
      tuple = tuples[i].split('=');
      v = unescape(tuple[1]);
      params[tuple[0]] = (v === 'true' || v === 'false') ? Boolean(v) :
                          /^\d*$/.test(v) ? +v :
                          v;
    }

    return params;
  },

  /**
   * Parses a URL into easily-consumable parts.
   * @param {string} url
   * @return {{
   *   protocol: string,
   *   hostname: string,
   *   port: string,
   *   path: string,
   *   url: string,
   *   params: Object.<string, string>
   * }}
   * @throws {Error}
   */
  parse: function (url) {
    var parsed = {},
      chunks, host;

    parsed.url = url;
    parsed.params = urlutil.parseParams(url);

    chunks = url.split('//');

    if (chunks.length === 2) {
      parsed.protocol = chunks.shift().slice(0, -1);
    } else if (chunks.length === 1) {
      parsed.protocol = '';
    } else {
      throw new Error('Can\'t parse malformed URL: ' + url);
    }

    chunks = chunks.shift().split('/');
    host = chunks[0];

    if (host.charAt(0) === '/') {
      parsed.hostname = parsed.port = '';
    } else {
      host = chunks.shift().split('?').shift().split(':');
      parsed.hostname = host[0];
      parsed.port = host[1] || '';
    }

    parsed.path = chunks.join('/').split('?').shift();

    return parsed;
  },

  /**
   * Joins path fragments into a path.
   * @param {...string} var_args
   * @return {string}
   */
  join: function (var_args) {
    var paths = Array.prototype.slice.call(arguments),
      base = paths.shift(),
      parts = [],
      path;

    if (!paths.length)
      return base;

    if (base.charAt(base.length - 1) === '/')
      base = base.slice(0, -1);

    parts.push(base);

    while (paths.length) {
      path = paths.shift();

      if (!path)
        continue;

      if (path.charAt(0) === '/')
        path = path.slice(1);

      if (path.charAt(path.length - 1) === '/')
        path = path.slice(0, -1);

      parts.push(path);
    }

    return parts.join('/');
  }
};
