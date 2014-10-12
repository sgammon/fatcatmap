/**
 * @fileoverview Unit tests for the fatcatmap url utility.
 *
 * @author  David Rekow <david@momentum.io>,
 *          Sam Gammon <sam@momentum.io>,
 *          Alex Rosner <alex@momentum.io>,
 *          Ian Weisberger <ian@momentum.io>
 * copyright (c) momentum labs, 2014
 */

goog.require('util.url');

describe('util.url', function () {

  var params, url;

  beforeEach(function () {
    params = {
      'a': 'b',
      'c': 2,
      'd': 'the yellow brick road',
      'e': true
    };
    url = {
      base: 'http://google.com',
      qs: 'a=b&c=2&d=the%20yellow%20brick%20road&e=true',
      full: 'http://google.com?a=b&c=2&d=the%20yellow%20brick%20road&e=true'
    };
  });

  afterEach(function () {
    params = url = null;
  });

  it('should append URL params', function () {
    expect(util.url.addParams('http://google.com', params)).toEqual(url.full);
    expect(util.url.addParams('http://google.com?f=f', params)).toEqual(
      url.base + '?' + 'f=f&' + url.qs);
  });

  it('should parse URL parameters', function () {
    expect(util.url.parseParams(url.full)).toEqual(params);
    expect(util.url.parseParams(url.base)).toEqual({});
  });

  it('should parse a URL into an object', function () {
    expect(util.url.parse(url.full)).toEqual({
      protocol: 'http',
      hostname: 'google.com',
      port: 80,
      path: '',
      url: url.full,
      params: params
    });
    expect(util.url.parse(url.base)).toEqual({
      protocol: 'http',
      hostname: 'google.com',
      port: 80,
      path: '',
      url: url.base,
      params: {}
    });
    expect(util.url.parse(url.qs)).toEqual({
      protocol: '',
      hostname: '',
      port: '',
      path: '',
      url: url.qs,
      params: params
    });
  });

  it('should join URL fragments, resolving relative directories', function () {
    expect(util.url.join('a', 'b', 'c')).toEqual('a/b/c');
    expect(util.url.join('a/', 'b', 'c')).toEqual('a/b/c');
    expect(util.url.join('/a', 'b', 'c')).toEqual('/a/b/c');
    expect(util.url.join('a', './b', 'c')).toEqual('a/b/c');
    expect(util.url.join('a', '.b', 'c/')).toEqual('a/.b/c');
    expect(util.url.join('a', '../b', 'c')).toEqual('b/c');
    expect(util.url.join('a', 'b', '../c')).toEqual('a/c');
    expect(util.url.join('a', '/b', 'c')).toEqual('a/c');
    expect(util.url.join('a', 'b', '/c')).toEqual('a/b');
  });
});
