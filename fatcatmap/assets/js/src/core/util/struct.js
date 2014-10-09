/**
 * @fileoverview Catnip core datastructures.
 *
 * @author  David Rekow <david@momentum.io>,
 *          Sam Gammon <sam@momentum.io>,
 *          Alex Rosner <alex@momentum.io>,
 *          Ian Weisberger <ian@momentum.io>
 * 
 * copyright (c) momentum labs, 2014
 */

goog.provide('util.struct');

/**
 * @constructor
 * @param {*} data
 * @param {util.struct.ListItem=} previous
 * @param {util.struct.ListItem=} next
 */
util.struct.ListItem = function (data, previous, next) {
  /**
   * @type {*}
   */
  this.data = data;

  /**
   * @type {?util.struct.ListItem}
   */
  this.previous = previous || null;

  /**
   * @type {?util.struct.ListItem}
   */
  this.next = next || null;

  if (this.previous)
    this.previous.next = this;

  if (this.next)
    this.next.previous = this;
};

/**
 * @constructor
 * @param {Array.<*>=} items
 * @param {number=} limit
 */
var BiLinkedList = function (items, limit) {
  /**
   * @type {?util.struct.ListItem}
   */
  this.head = null;

  /**
   * @type {?util.struct.ListItem}
   */
  this.tail = null;

  /**
   * @type {number}
   */
  this.length = 0;

  /**
   * @type {number}
   */
  this.limit = limit || Infinity;

  if (items && Array.isArray(items))
    this.rpushAll(items);
};

BiLinkedList.prototype._increment = function () {
  this.length += 1;

  while (this.length > this.limit) {
    this.tail = this.tail.previous;
    this.tail.next = null;

    this.length -= 1;
  }
};

/**
 * @param {*} item
 */
BiLinkedList.prototype.lpush = function (item) {
  this.head = new util.struct.ListItem(item, null, this.head);

  if (!this.tail)
    this.tail = this.head;

  this._increment();
};

/**
 * @param {*} item
 */
BiLinkedList.prototype.rpush = function (item) {
  this.tail = new util.struct.ListItem(item, this.tail);

  if (!this.head)
    this.head = this.tail;

  this._increment();
};

/**
 * @param {Array.<*>} items
 */
BiLinkedList.prototype.lpushAll = function (items) {
  var i;

  items = items || [];

  for (i = 0; i < items.length; i++) {
    this.lpush(items[i]);
  }
};

/**
 * @param {Array.<*>} items
 */
BiLinkedList.prototype.rpushAll = function (items) {
  var i;

  items = items || [];

  for (i = 0; i < items.length; i++) {
    this.rpush(items[i]);
  }
};

/**
 * @return {*}
 */
BiLinkedList.prototype.lpop = function () {
  var head;

  if (!this.head)
    return;

  head = this.head;
  this.head = this.head.next;

  this.length -= 1;

  return head.data;
};

/**
 * @return {*}
 */
BiLinkedList.prototype.rpop = function () {
  var tail;

  if (!this.tail)
    return;

  tail = this.tail;
  this.tail = this.tail.previous;

  this.length -= 1;

  return tail.data;
};

util.struct.BiLinkedList = BiLinkedList;
