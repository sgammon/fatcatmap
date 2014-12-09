/**
 * @fileoverview Unit tests for the fatcatmap array utility.
 *
 * @author  David Rekow <david@momentum.io>,
 *          Sam Gammon <sam@momentum.io>,
 *          Alex Rosner <alex@momentum.io>,
 *          Ian Weisberger <ian@momentum.io>
 * copyright (c) momentum labs, 2014
 */

goog.require('util.array');

describe('util.array', function () {
  var arr, args;

  beforeEach(function () {
    arr = [1, 2, 3];
    args = (function (a, b, c) {
      return arguments;
    })('a', 'b', 'c');
  });

  afterEach(function () {
    arr = args = null;
  });

  it('should convert a list-like object to an array', function () {
    expect(util.array.toArray(args)).toEqual(['a', 'b', 'c']);
  });

  it('should normalize passed arguments to a single array', function () {
    expect(util.array.normalize()).toEqual([]);
    expect(util.array.normalize(1, 2, 3)).toEqual([1, 2, 3]);
    expect(util.array.normalize(args)).toEqual(['a', 'b', 'c']);
    expect(util.array.normalize(arr)).toEqual([1, 2, 3]);
    expect(util.array.normalize(1)).toEqual([1]);
  });

  it('should shallowly flatten an array of passed arrays into a single array', function () {
    expect(util.array.flatten([
      arr,
      util.array.toArray(args),
      'hello',
      false,
      [4, 5, 6],
      [
        ['c','d', 'e']
      ]
    ])).toEqual([
      1, 2, 3, 'a', 'b', 'c', 'hello', false, 4, 5, 6, ['c', 'd', 'e']
    ]);
  });

  it('should deeply flatten an array of passed arrays into a single array', function () {
    expect(util.array.flatten([
      arr,
      util.array.toArray(args),
      'hello',
      false,
      [4, 5, 6],
      [
        ['c','d', 'e']
      ]
    ], true)).toEqual([
      1, 2, 3, 'a', 'b', 'c', 'hello', false, 4, 5, 6, 'c', 'd', 'e'
    ]);
  });
});
