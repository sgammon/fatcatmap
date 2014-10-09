/*jshint -W030 */
/**
 * @fileoverview Fatcatmap data models.
 *
 * @author  David Rekow <david@momentum.io>,
 *          Sam Gammon <sam@momentum.io>,
 *          Alex Rosner <alex@momentum.io>,
 *          Ian Weisberger <ian@momentum.io>
 *
 * copyright (c) momentum labs, 2014
 */

goog.require('util.object');

goog.provide('models.data');

var Key, KeyedItem, KeyIndexedList;

/**
 * @constructor
 * @param {string} kind
 * @param {(string|number)} id
 * @param {(string|models.data.Key)=} parent
 * @throws {TypeError} If either kind or id is not present.
 */
Key = function (kind, id, parent) {
  /*jshint eqnull:true */
  if (kind == null || id == null)
    throw new TypeError('Key() requires a kind and id.');

  if (parent instanceof Key)
    parent = parent._flat;

  /**
   * @expose
   * @type {string}
   */
  this.kind = kind;

  /**
   * @expose
   * @type {(string|number)}
   */
  this.id = id;

  /**
   * @protected
   * @type {?string}
   */
  this._parent = parent || null;

  /**
   * @protected
   * @type {string}
   */
  this._flat = (parent || '') + ':' + kind + ':' + id;

  /**
   * @protected
   * @type {string}
   */
  this._safe = Key.encode(this._flat);

  if (parent && !Key.registry[parent])
    parent = Key.inflate(parent);

  Key.registry[this._flat] = this;
};

util.object.mixin(Key, /** @lends {Key.prototype} */{
  /**
   * Default Key get is a noop. Overwrite to retrieve from somewhere. Read-only.
   * @expose
   * @return {?KeyedItem}
   */
  get: function () {},

  /**
   * Returns a flattened, human-readable string key representation.
   * @expose
   * @return {string}
   */
  flatten: function () {
    return this._flat;
  },

  /**
   * Returns an encoded, urlsafe string key representation.
   * @expose
   * @return {string}
   */
  urlsafe: function () {
    return this._safe;
  },

  /**
   * Checks whether a passed Key or string is equivalent to the current Key.
   * @expose
   * @param {(string|Key)} key
   * @return {boolean}
   */
  equals: function (key) {
    if (typeof key === 'string')
      return key === this._flat || key === this._safe;

    if (!(key instanceof Key))
      return false;

    return key._safe === this._safe;
  }
});

/**
 * Default string serialization.
 * @expose
 * @return {string}
 */
Key.prototype.toString = Key.prototype.urlsafe;

/**
 * @expose
 * @type {?models.data.Key}
 */
Key.prototype.parent;

Object.defineProperty(Key.prototype, 'parent', {
  /**
   * @expose
   * @type {boolean}
   */
  enumerable: true,

  /**
   * @expose
   * @return {?models.data.Key}
   * @this {models.data.Key}
   */
  get: function () {
    return this._parent ? Key.registry[this._parent] || null : null;
  }
});

util.object.extend(Key, /** @lends {Key} */{
  /**
   * @static
   * @param {(string|models.data.Key} flat Fully-unpacked flattened key string. If base64 encoded,
   *    will first be decoded. If already a Key, will just be returned.
   * @return {models.data.Key}
   * @throws {TypeError} If <code>flat</code> is not a string or is malformed.
   */
  inflate: function (flat) {
    var parts, id, kind, parent;

    if (flat instanceof Key)
      return flat;

    if (typeof flat !== 'string')
      throw new TypeError('Key.inflate() expects a key string to inflate.');

    if (flat.indexOf(':') === -1)
      flat = Key.decode(flat);

    if (Key.registry[flat])
      return Key.registry[flat];

    parts = flat.split(':');
    id = parts.pop();
    kind = parts.pop();
    parent = parts.length ? parts.join(':') : null;

    return new Key(kind, id, parent);
  },

  /**
   * @static
   * @param {!Array.<string>} packed
   * @param {!Array.<string>} kinds
   * @return {models.data.KeyIndexedList.<models.data.Key>}
   * @throws {(TypeError|Error)} If either packed or kinds is not an Array, or if a malformed packed
   *    key is encountered.
   */
  unpack: function (packed, kinds) {
    var keys, index;

    if (!(Array.isArray(packed) && Array.isArray(kinds)))
      throw new TypeError('_inflateKeys expects a list of packed keys and list of kinds.');

    keys = new KeyIndexedList().key(
      /**
       * @param {models.data.Key} item
       * @return {string}
       */
      function (item) {
        return item._safe;
      });

    packed.forEach(function (key, i) {
      var parts = key.split(':'),
        kind = kinds[+parts.shift()],
        id = parts.shift(),
        parent = parts.length ? keys[+parts.shift()] : null;

      if (!(kind && id))
        throw new Error('Can\'t unpack malformed key: ' + key);

      keys.push(new Key(kind, id, parent));
    });

    return keys;
  },

  /**
   * @static
   * @param {string} flat Fully-unpacked flattened key string.
   * @return {string} Base64-encoded key string.
   * @throws {TypeError} If <code>safe</code> is not a string.
   */
  encode: function (flat) {
    return btoa(flat);
  },

  /**
   * @static
   * @param {string} safe Base64-encoded, fully-unpacked flattened key string.
   * @return {string}
   * @throws {TypeError} If <code>safe</code> is not a string.
   */
  decode: function (flat) {
    return atob(flat);
  },

  /**
   * @static
   * @type {Object.<string, models.data.Key>}
   */
  registry: {}
});

window['Key'] = Key;

/**
 * @constructor
 * @param {!(string|models.data.Key)} key
 * @throws {TypeError} If key is not a string or Key.
 */
KeyedItem = function (key) {
  if (!(key instanceof Key)) {
    if (typeof key !== 'string')
      throw new TypeError('KeyedItem() expects a Key or string key as the first parameter.');

    key = Key.inflate(key);
  }

  /**
   * @protected
   * @type {models.data.Key}
   */
  this.__key = key;
};

/**
 * @return {string}
 */
KeyedItem.prototype.toString = function () {
  var obj = {},
    k;

  for (k in this) {
    if (k !== '__key' && this.hasOwnProperty(k))
      obj[k] = this[k];
  }

  obj['key'] = this.key;

  return JSON.stringify(obj);
};

/**
 * @expose
 * @type {string}
 */
KeyedItem.prototype.key;

Object.defineProperty(KeyedItem.prototype, 'key', {
  /**
   * @expose
   * @type {boolean}
   */
  enumerable: true,

  /**
   * @expose
   * @return {string}
   * @this {models.data.KeyedItem}
   */
  get: function () {
    return this.__key;
  }
});

/**
 * @expose
 * @type {string}
 */
KeyedItem.prototype.kind;

Object.defineProperty(KeyedItem.prototype, 'kind', {
  /**
   * @expose
   * @type {boolean}
   */
  enumerable: true,

  /**
   * @expose
   * @return {string}
   * @this {models.data.KeyedItem}
   */
  get: function () {
    return this.__key.kind;
  }
});


/**
 * @constructor
 * @extends {Array}
 * @param {(number|...[models.data.KeyedItem])} item
 */
KeyIndexedList = function (item) {
  Array.apply(this, arguments);

  /**
   * @type {Object.<string, number>}
   */
  this.index = {};
};

util.object.inherit(KeyIndexedList, Array);

util.object.mixin(KeyIndexedList, /** @lends {KeyIndexedList.prototype} */{
  /**
   * @param {(KeyedItem|function(*): string)} item
   * @return {string|KeyIndexedList}
   */
  key: function (item) {
    if (typeof item === 'function') {
      /**
       * @param {*} item
       * @return {string}
       */
      this.key = item;

      return this;
    }

    return item.key;
  },

  /**
   * @param {(number|string|models.data.Key)} key
   * @return {?models.data.KeyedItem}
   */
  get: function (key) {
    /*jshint eqnull:true */
    var i;

    if (typeof key === 'number')
      return this[key];

    if (key instanceof Key)
      key = key.urlsafe();

    i = this.index[key];

    if (i != null)
      i = this[i];

    return i;
  },

  /**
   * @override
   * @param {...[models.data.KeyedItem]} item
   * @return {?number}
   */
  push: function (item) {
    /*jshint eqnull: true */
    var key = this.key(item),
      i, _i, _item;

    if (!key) {
      console.warn('KeyIndexedList.push() only accepts KeyedItems.');
      return null;
    }

    for (i = 0; i < arguments.length; i++) {
      item = arguments[i];
      key = this.key(item);
      _i = this.index[key];

      if (_i != null) {
        _item = this[_i];
        this[_i] = _item.merge ? _item.merge(item) : item;
      } else {
        this.index[key] = Array.prototype.push.call(this, item) - 1;
      }
    }

    return this.length;
  },

  /**
   * @override
   * @param {...[models.data.KeyedItem]} item
   * @return {?number}
   */
  unshift: function (item) {
    /*jshint eqnull:true */
    var key = this.key(item),
      len = arguments.length,
      newItems = [],
      i, _item, _i;

    if (!key) {
      console.warn('KeyIndexedList.unshift() only accepts KeyedItems.');
      return null;
    }

    for (i = 0; i < len; i++) {
      item = arguments[i];
      key = this.key(item);
      _i = this.index[key];

      if (_i != null) {
        _item = this[_i];
        this[_i] = _item.merge ? _item.merge(item) : item;
      } else {
        newItems.push(item);
      }
    }

    len = newItems.length;

    for (i = 0; i < len; i++) {
      this.index[this.key(newItems[i])] = len - i - 1;
    }

    return this.length;
  },

  /**
   * @override
   * @return {?models.data.KeyedItem}
   */
  pop: function () {
    var item = Array.prototype.pop.call(this);

    if (item)
      this.index[this.key(item)] = null;

    return item;
  },

  /**
   * @override
   * @return {?models.data.KeyedItem}
   */
  shift: function () {
    var item = Array.prototype.shift.call(this);

    if (item)
      this.index[this.key(item)] = null;

    return item;
  },

  /**
   * @override
   * @param {number} index
   * @param {number=} remove
   * @param {...[*]} item
   * @return {Array.<models.data.KeyedItem>}
   */
  splice: function (index, remove, item) {
    var list = this;
    return Array.prototype.splice.apply(this, arguments).map(function (item) {
      list.index[list.key(item)] = null;
      return item;
    });
  },

  /**
   * @param {(KeyIndexedList|Array.<models.data.KeyedItem>)} list
   * @return {KeyIndexedList}
   */
  merge: function (list) {
    if (list.length)
      this.push.apply(this, list);
    return this;
  }
});

/**
 * @type {(Array.<(string|Object)>|models.data.KeyIndexedList)} */
GraphData.data.keys;

/**
 * @expose
 */
models.data = {
  /**
   * @expose
   * @constructor
   * @param {string} kind
   * @param {(string|number)} id
   * @param {(string|Key)=} parent
   * @throws {TypeError} If either kind or id is not present.
   */
  Key: Key,

  /**
   * @constructor
   * @param {(string|models.data.Key)} key
   * @throws {TypeError} If key is not a string or Key.
   */
  KeyedItem: KeyedItem,

  /**
   * @constructor
   * @extends {Array}
   * @param {(number|...[models.data.KeyedItem])} item
   */
  KeyIndexedList: KeyIndexedList
};
