/**
 * @fileoverview Unit tests for the fatcatmap core datastructures.
 *
 * @author  David Rekow <david@momentum.io>,
 *          Sam Gammon <sam@momentum.io>,
 *          Alex Rosner <alex@momentum.io>,
 *          Ian Weisberger <ian@momentum.io>
 * copyright (c) momentum labs, 2014
 */

goog.require('util.structs');

describe('util.structs', function () {
  var current, prev, next;

  beforeEach(function () {
    prev = new util.structs.ListItem('prev');
    next = new util.structs.ListItem('next');
  });

  afterEach(function () {
    current = prev = next = null;
  });

  it('should instantiate a sole ListItem', function () {
    current = new util.structs.ListItem('current');

    expect(current.data).toEqual('current');
    expect(current.previous).toEqual(null);
    expect(current.next).toEqual(null);
  });

  it('should instantiate a ListItem after an item', function () {
    current = new util.structs.ListItem('current', prev);

    expect(current.data).toEqual('current');
    expect(current.previous).toEqual(prev);
    expect(current.next).toEqual(null);

    expect(prev.next).toEqual(current);
    expect(prev.previous).toEqual(null);
  });

  it('should instantiate a ListItem before an item', function () {
    current = new util.structs.ListItem('current', null, next);

    expect(current.data).toEqual('current');
    expect(current.previous).toEqual(null);
    expect(current.next).toEqual(next);

    expect(next.previous).toEqual(current);
    expect(next.next).toEqual(null);
  });

  it('should instantiate a ListItem between two items', function () {
    current = new util.structs.ListItem('current', prev, next);

    expect(current.data).toEqual('current');
    expect(current.previous).toEqual(prev);
    expect(current.next).toEqual(next);

    expect(prev.next).toEqual(current);
    expect(prev.previous).toEqual(null);

    expect(next.previous).toEqual(current);
    expect(next.next).toEqual(null);
  });
});