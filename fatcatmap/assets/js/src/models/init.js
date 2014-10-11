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

var Key, KeyedItem, KeyIndexedList;

/**
 * @constructor
 * @param {string} kind
 * @param {(string|number)} id
 * @param {(string|models.Key)=} parent
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

  /**
   * @private
   * @type {?KeyedItem}
   */
  this.__data__ = null;

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
      return key === this._flat || key === this._safe;

    if (!(key instanceof Key))
      return false;

    return key._safe === this._safe;
  },

  /**
   * Binds a key to a data item.
   * @expose
   * @param {*} data
   * @return {models.Key}
   * @throws {Error} If data is keyed and key doesn't match current Key.
   */
  bind: function (data) {
    /*jshint eqnull:true */
    if (data != null) {

      if (data.key && !this.equals(data.key))
        throw new Error('Can\'t bind() data to a mismatched key: ' + this);

      if (data['super'] && typeof data['super'] === 'string')
        data['super'] = Key.inflate(data['super']);
    }

    this.__data__ = data;

    return this;
  },

  /**
   * Returns any bound data.
   * @expose
   * @return {*}
   */
  data: function () {
    return this.__data__;
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
    return this._parent ? Key.registry[this._parent] || null : null;
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
   * @return {models.KeyIndexedList.<models.Key>}
   * @throws {(TypeError|Error)} If either packed or kinds is not an Array, or if a malformed packed
   *    key is encountered.
   */
  unpack: function (packed, kinds) {
    var keys, index;

    if (!(Array.isArray(packed) && Array.isArray(kinds)))
      throw new TypeError('_inflateKeys expects a list of packed keys and list of kinds.');

    keys = new KeyIndexedList().key(
      /**
       * @param {models.Key} item
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
   * @type {Object.<string, models.Key>}
   */
  registry: {}
});

window['Key'] = Key;

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
   * @type {!models.Key}
   */
  this.__key__ = key;
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

    obj['key'] = this.key.urlsafe();

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
    return this.__key__;
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
    return this.__key__.kind;
  }
});


/**
 * @constructor
 * @extends {Array}
 * @param {(number|...[models.KeyedItem])} item
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
   * @param {(number|string|models.Key)} key
   * @return {?models.KeyedItem}
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
 * @type {(Array.<(string|Object)>|models.KeyIndexedList)} */
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
   * @param {(number|...[models.KeyedItem])} item
   */
  KeyIndexedList: KeyIndexedList
};
