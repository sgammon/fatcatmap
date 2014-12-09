/**
 * @fileoverview Unit tests for the fatcatmap object utility.
 *
 * @author  David Rekow <david@momentum.io>,
 *          Sam Gammon <sam@momentum.io>,
 *          Alex Rosner <alex@momentum.io>,
 *          Ian Weisberger <ian@momentum.io>
 * copyright (c) momentum labs, 2014
 */

goog.require('util.object');

describe('util.object', function () {
  var obj;

  beforeEach(function () {
    obj = {
      a: {
        b: 'B',
        c: {
          d: 'D'
        }
      },
      e: {
        f: 'F'
      },
      k: 'K'
    };
  });

  afterEach(function () {
    obj = null;
  });

  it('should identify a raw object', function () {
    expect(util.object.isObject(obj)).toBe(true);
    expect(util.object.isObject([])).toBe(false);
    expect(util.object.isObject(true)).toBe(false);
    expect(util.object.isObject(null)).toBe(false);
    expect(util.object.isObject(undefined)).toBe(false);
    expect(util.object.isObject(3)).toBe(false);
  });

  it('should resolve deeply nested key paths', function () {
    expect(util.object.resolve(obj, 'a.b')).toEqual('B');
    expect(util.object.resolve(obj, 'a.c.d')).toEqual('D');
    expect(util.object.resolve(obj, 'e.f')).toEqual('F');
    expect(util.object.resolve(obj, 'k')).toEqual('K');
  });

  it('should resolve and set deeply nested key paths', function () {
    var _obj = {};
    util.object.resolveAndSet(_obj, 'a.b.c.g.h', 'H');
    util.object.resolveAndSet(_obj, 'e.f.i.j', 'J');
    
    expect(_obj['a']['b']['c']['g']['h']).toEqual('H');
    expect(_obj['e']['f']['i']['j']).toEqual('J');
  });
});
