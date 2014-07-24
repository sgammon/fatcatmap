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
   * @type {function(string)}
   */
  encode: encodeURIComponent,

  /**
   * @param {string} url
   * @param {Object.<string, string>} params
   * @return {string}
   */
  addParams: function (url, params) {
    if (url.indexOf('?') === -1) {
      url += '?';
    }

    for (var k in params) {
      if (params.hasOwnProperty(k)) {
        url += '&' + this.encode(k) + '=' + this.encode(params[k]);
      }
    }

    return url;
  },

  /**
   * @param {string} url
   * @return {Object.<string, string>} params
   */
  parseParams: function (url) {
    var params = {},
      tuples = url.split('?').pop().split('&'),
      tuple, v;

    for (var i = 0; i < tuples.length; i++) {
      tuple = tuples[i].split('=');
      v = tuple[1];
      params[tuple[0]] = (v === 'true' || v === 'false') ? Boolean(v) :
                          /^[0-9]+$/.test(url) ? +v :
                          v;
    }

    return params;
  },

  /**
   * @param {string} url
   * @return {{
   *   protocol: string,
   *   hostname: string,
   *   port: string,
   *   path: string,
   *   url: string,
   *   params: Object.<string, string>
   * }}
   * @throws {SyntaxError}
   */
  parse: function (url) {
    var parsed = {},
      chunks, host;

    parsed.url = url;
    parsed.params = this.parseParams(url);

    chunks = url.split('//');

    if (chunks.length === 2) {
      parsed.protocol = chunks.shift();
    } else if (chunks.length === 1) {
      parsed.protocol = '';
    } else {
      throw new SyntaxError('Malformed URL: ' + url);
    }

    chunks = chunks.shift().split('/');
    host = chunks[0];

    if (host.charAt(0) === '/') {
      parsed.hostname = parsed.port = '';
    } else {
      host = chunks.shift().split(':')
      parsed.hostname = chunks[0];
      parsed.port = chunks[1] || '';
    }

    parsed.path = chunks.join('/').split('?').shift();

    return parsed;
  }
}