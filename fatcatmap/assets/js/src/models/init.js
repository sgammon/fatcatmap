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

goog.provide('models');

var Key, KeyedItem, KeyIndexedList, KeyList;

/**
 * @constructor
 * @param {string} kind
 * @param {(string|number)} id
 * @param {(string|models.Key)=} parent
 * @throws {TypeError} If either kind or id is not present.
 */
Key = function (kind, id, parent) {
  /*jshint eqnull:true */
  var flat;

  if (kind == null || id == null)
    throw new TypeError('Key() requires a kind and id.');

  if (parent instanceof Key)
    parent = parent._flat;

  if (typeof parent !== 'string')
    parent = null;

  flat = (parent || '') + ':' + kind + ':' + id;

  if (Key.registry[flat])
    return Key.registry[flat];

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
  this._parent = parent;

  /**
   * @protected
   * @type {?Key}
   */
  this._super = null;

  /**
   * @protected
   * @type {string}
   */
  this._flat = flat;

  /**
   * @protected
   * @type {string}
   */
  this._safe = Key.encode(flat);

  if (parent) {
    parent = Key.registry[parent] || Key.inflate(parent);
    Key.ancestry[parent._flat].push(this);
  }

  Key.registry[flat] = this;
  Key.ancestry[flat] = new KeyList();
};

util.object.mixin(Key, /** @lends {Key.prototype} */{
  /**
   * Default Key get is a noop. Overwrite to retrieve from somewhere. Read-only.
   * @expose
   * @return {?KeyedItem}
   */
  get: function () {},

  /**
   * Default Key put is a noop. Overwrite to persist to somewhere. Read-only.
   * @expose
   */
  put: function () {},

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
      return key === this._safe || key === this._flat;

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
Key.prototype.toString = Key.prototype.toJSON = Key.prototype.urlsafe;

/**
 * @expose
 * @type {?models.Key}
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
   * @return {?models.Key}
   * @this {models.Key}
   */
  get: function () {
    return this._parent ? Key.registry[this._parent] : null;
  }
});

/**
 * @expose
 * @type {?Array.<models.Key>}
 */
Key.prototype.children;

Object.defineProperty(Key.prototype, 'children', {
  /**
   * @expose
   * @type {boolean}
   */
  enumerable: true,

  /**
   * @expose
   * @return {?Array.<models.Key>}
   * @this {models.Key}
   */
  get: function () {
    return Key.ancestry[this._flat];
  }
});

util.object.extend(Key, /** @lends {Key} */{
  /**
   * @static
   * @param {(string|models.Key} flat Fully-unpacked flattened key string. If base64 encoded,
   *    will first be decoded. If already a Key, will just be returned.
   * @return {models.Key}
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
   * @return {models.KeyList.<models.Key>}
   * @throws {(TypeError|Error)} If either packed or kinds is not an Array, or if a malformed packed
   *    key is encountered.
   */
  unpack: function (packed, kinds) {
    var keys, index;

    if (!(Array.isArray(packed) && Array.isArray(kinds)))
      throw new TypeError('Key.unpack() expects a list of packed keys and list of kinds.');

    keys = new KeyList();

    packed.forEach(function (parts, i) {
      var kind, id, parent;

      parts = parts.split(':');

      kind = kinds[+parts.shift()];
      id = parts.shift();
      parent = parts.length ? keys[+parts.shift()] : null;

      if (!(kind && id))
        throw new Error('Key.unpack() can\'t unpack malformed key: ' + parts);

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
    return window.btoa(flat);
  },

  /**
   * @static
   * @param {string} safe Base64-encoded, fully-unpacked flattened key string.
   * @return {string} Human-readable flattened key string.
   * @throws {TypeError} If <code>safe</code> is not a string.
   */
  decode: function (safe) {
    return window.atob(safe);
  },

  /**
   * @static
   * @type {Object.<string, models.Key>}
   */
  registry: {},

  /**
   * @static
   * @type {Object.<string, models.KeyList.<models.Key>}
   */
  ancestry: {}
});


/**
 * @constructor
 * @param {!(string|models.Key)} key
 * @throws {TypeError} If key is not a string or Key.
 */
KeyedItem = function (key) {
  if (!(key instanceof Key)) {
    if (typeof key !== 'string')
      throw new TypeError('KeyedItem() expects a Key or string key as the first parameter.');

    key = Key.inflate(key);
  }

  /**
   * @private
   * @type {!string}
   */
  this.__id__ = key.flatten();
};

util.object.mixin(KeyedItem, /** @lends {KeyedItem.prototype} */{
  /**
   * @expose
   * @return {Object}
   */
  toJSON: function () {
    var obj = {},
      k;

    for (k in this) {
      if (this.hasOwnProperty(k) && k.charAt(0) !== '_')
        obj[k] = this[k];
    }

    obj['key'] = Key.encode(this.__id__);

    return obj;
  },

  /**
   * @expose
   * @return {string}
   */
  toString: function () {
    return JSON.stringify(this.toJSON());
  }
});

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
   * @this {models.KeyedItem}
   */
  get: function () {
    return Key.registry[this.__id__];
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
   * @this {models.KeyedItem}
   */
  get: function () {
    return this.key.kind;
  }
});


/**
 * @constructor
 * @extends {Array}
 * @param {(number|models.KeyedItem)} length
 * @param {...[models.KeyedItem]} item
 */
KeyIndexedList = function (length, item) {
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
   * @param {(number|string|models.Key)} key
   * @return {?models.KeyedItem}
   */
  get: function (key) {
    /*jshint eqnull:true */
    var i;

    if (typeof key === 'number')
      return this[key];

    i = this.index[key];

    if (i != null)
      i = this[i];

    return i;
  },

  /**
   * @param {!(string|models.Key)} key
   * @return {boolean}
   * @throws {TypeError} If key is not a string or Key.
   */
  has: function (key) {
    if (!(typeof key === 'string' || key instanceof Key))
      throw new TypeError('KeyIndexedList.has() expects a string key or instance of Key.');

    return typeof this.index[key] === 'number';
  },

  /**
   * @param {function(models.KeyedItem): boolean} query
   * @return {?models.KeyedItem}
   */
  find: function (query) {
    var i;

    for (i = 0; i < this.length; i++) {
      if (query(this[i]) === true)
        return this[i];
    }

    return null;
  },

  /**
   * @override
   * @param {...[models.KeyedItem]} item
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
   * @param {...[models.KeyedItem]} item
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
   * @return {?models.KeyedItem}
   */
  pop: function () {
    var item = Array.prototype.pop.call(this);

    if (item)
      this.index[this.key(item)] = null;

    return item;
  },

  /**
   * @override
   * @return {?models.KeyedItem}
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
   * @return {Array.<models.KeyedItem>}
   */
  splice: function (index, remove, item) {
    var list = this;
    return Array.prototype.splice.apply(this, arguments).map(function (item) {
      list.index[list.key(item)] = null;
      return item;
    });
  },

  /**
   * @param {(KeyIndexedList|Array.<models.KeyedItem>)} list
   * @return {KeyIndexedList}
   */
  merge: function (list) {
    if (list.length)
      this.push.apply(this, list);
    return this;
  },

  /**
   * @expose
   * @return {Object}
   */
  toJSON: function () {
    return this.map(this.key);
  },

  /**
   * @expose
   * @return {string}
   */
  toString: function () {
    return JSON.stringify(this.toJSON());
  }
});


/**
 * @constructor
 * @extends {KeyIndexedList}
 * @param {(number|models.KeyedItem)} length
 * @param {...[models.KeyedItem]} item
 */
KeyList = function (length, item) {
  KeyIndexedList.apply(this, arguments);
};

util.object.inherit(KeyList, KeyIndexedList);

util.object.mixin(KeyList, /** @lends {KeyList.prototype} */{
  /**
   * @override
   * @param {(KeyedItem|function(*): string)} item
   * @return {string}
   */
  key: function (item) {
    return String(item);
  }
});


/**
 * @type {(Array.<(string|Object)>|models.KeyList)} */
GraphData.data.keys;


/**
 * @expose
 */
models = {
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
   * @param {(string|models.Key)} key
   * @throws {TypeError} If key is not a string or Key.
   */
  KeyedItem: KeyedItem,

  /**
   * @constructor
   * @extends {Array}
   * @param {(number|models.KeyedItem)} length
   * @param {...[models.KeyedItem]} item
   */
  KeyIndexedList: KeyIndexedList,

  /**
   * @constructor
   * @extends {KeyIndexedList}
   * @param {(number|models.KeyedItem)} length
   * @param {...[models.KeyedItem]} item
   */
  KeyList: KeyList
};