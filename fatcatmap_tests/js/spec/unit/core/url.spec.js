/**
 * @fileoverview Unit tests for the fatcatmap core platform.
 *
 * @author  David Rekow <david@momentum.io>,
 *          Sam Gammon <sam@momentum.io>,
 *          Alex Rosner <alex@momentum.io>,
 *          Ian Weisberger <ian@momentum.io>
 * copyright (c) momentum labs, 2014
 */

// describe("The core url utility", function () {

//   var params, url;

//   beforeEach(function () {
//     params = {
//       'a': 'b',
//       'c': 2,
//       'd': 'the yellow brick road',
//       'e': true
//     };
//     url = {
//       base: 'http://google.com',
//       qs: 'a=b&c=2&d=the%20yellow%20brick%20road&e=true',
//       full: 'http://google.com?a=b&c=2&d=the%20yellow%20brick%20road&e=true'
//     };
//   });

//   afterEach(function () {
//     params = url = null;
//   });

//   it('should correctly append URL params to a naked URL', function () {
//     expect(urlutil.addParams('http://google.com', params)).toEqual(url.full);
//   });

//   it('should correctly append URL params to a URL with existing params', function () {
//     expect(urlutil.addParams('http://google.com?f=f', params)).toEqual(
//       url.base + '?' + 'f=f&' + url.qs);
//   });

//   it('should correctly parse URL parameters', function () {
//     expect(urlutil.parseParams(url.full)).toEqual(params);
//   });

//   it('should correctly parse a url into an object', function () {
//     expect(urlutil.parse(url.full)).toEqual({
//       protocol: 'http',
//       hostname: 'google.com',
//       port: '',
//       path: '',
//       url: url.full,
//       params: params
//     });
//   });
// });