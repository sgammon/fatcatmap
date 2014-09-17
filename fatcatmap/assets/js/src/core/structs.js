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

goog.provide('structs');

var ListItem, BiLinkedList;

/**
 * @constructor
 * @param {*} data
 * @param {ListItem=} previous
 * @param {ListItem=} next
 */
ListItem = function (data, previous, next) {
  /**
   * @type {*}
   */
  this.data = data;

  /**
   * @type {?ListItem}
   */
  this.previous = previous || null;

  /**
   * @type {?ListItem}
   */
  this.next = next || null;
};

/**
 * @constructor
 * @param {Array.<*>=} items
 * @param {number=} limit
 */
BiLinkedList = function (items, limit) {
  /**
   * @type {?ListItem}
   */
  this.head = null;

  /**
   * @type {?ListItem}
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
  item = new ListItem(item);

  if (!this.head) {
    this.head = this.tail = item;
    return;
  }

  item.next = this.head;
  this.head.previous = item;

  this.head = item;

  this._increment();
};

/**
 * @param {*} item
 */
BiLinkedList.prototype.rpush = function (item) {
  item = new ListItem(item);

  if (!this.tail) {
    this.head = this.tail = item;
    return;
  }

  item.previous = this.tail;
  this.tail.next = item;

  this.tail = item;
  this._increment();
};

/**
 * @param {Array.<*>} items
 */
BiLinkedList.prototype.lpushAll = function (items) {
  var i = 0;

  items = items || [];

  for (i ; i < items.length; i++) {
    this.lpush(items[i]);
  }
};

/**
 * @param {Array.<*>} items
 */
BiLinkedList.prototype.rpushAll = function (items) {
  var i = 0;

  items = items || [];

  for (i ; i < items.length; i++) {
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