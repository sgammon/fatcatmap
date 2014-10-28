/*jshint -W030 */
/**
 * @fileoverview Core model classes.
 *
 * @author  David Rekow <david@momentum.io>,
 *          Sam Gammon <sam@momentum.io>,
 *          Alex Rosner <alex@momentum.io>,
 *          Ian Weisberger <ian@momentum.io>
 *
 * copyright (c) momentum labs, 2014
 */

goog.require('util.object');

goog.provide('model');

/**
 * @constructor
 * @param {string} kind
 * @param {(string|number)} id
 * @param {(string|model.Key)=} parent
 * @throws {TypeError} If either kind or id is not present.
 */
model.Key = function (kind, id, parent) {
  /*jshint eqnull:true */
  var flat;

  if (kind == null || id == null)
    throw new TypeError('model.Key() requires a kind and id.');

  if (parent instanceof model.Key)
    parent = parent._flat;

  if (typeof parent !== 'string')
    parent = null;

  flat = (parent || '') + ':' + kind + ':' + id;

  if (model.Key.registry[flat])
    return model.Key.registry[flat];

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
   * @type {?model.Key}
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
  this._safe = model.Key.encode(flat);

  /**
   * @private
   * @type {?model.Model}
   */
  this.__data__ = null;

  if (parent) {
    parent = model.Key.inflate(parent);
    model.Key.ancestry.id[parent._flat].push(this);
  }

  model.Key.registry[flat] = this;

  model.Key.ancestry.id[flat] = new model.KeyList();

  if (!model.Key.ancestry.kind[kind])
    model.Key.ancestry.kind[kind.toLowerCase()] = parent ? parent.kind.toLowerCase() : null;
};

util.object.mixin(model.Key, /** @lends {model.Key.prototype} */{
  /**
   * Default get is a noop. Overwrite to retrieve from somewhere. Read-only.
   * @expose
   * @return {?model.KeyedItem}
   */
  get: function () {},

  /**
   * Default put is a noop. Overwrite to persist to somewhere. Read-only.
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
   * Returns a slash-delimited path representing this unique key.
   * @expose
   * @return {string}
   */
  path: function () {
    return '/' + this.kind.toLowerCase() + '/' + this.id;
  },

  /**
   * Checks whether a passed Key or string is equivalent to the current Key.
   * @expose
   * @param {(string|model.Key)} key
   * @return {boolean}
   */
  equals: function (key) {
    if (typeof key === 'string')
      return key === this._safe || key === this._flat;

    if (!(key instanceof model.Key))
      return false;

    return key._safe === this._safe;
  },


  /**
   * Returns any bound models.
   * @expose
   * @return {?model.Model}
   */
  data: function () {
    return this.__data__;
  },

  /**
   * Binds a key to a Model.
   * @expose
   * @param {?model.Model} data
   * @return {model.Key}
   * @throws {Error} If data is keyed and key doesn't match current Key.
   */
  bind: function (data) {
    /*jshint eqnull:true */
    var key = this;

    if (data != null) {
      if (data.key && !this.equals(data.key))
        throw new Error('Can\'t bind() data to a mismatched key: ' + this);

      if (data['super'] && typeof data['super'] === 'string')
        data['super'] = model.Key.inflate(data['super']);
    }

    if (!(data instanceof model.Model))
      data = new model.Model(this, data);

    this.__data__ = data;

    return data;
  }
});

/**
 * Default string serialization.
 * @expose
 * @return {string}
 */
model.Key.prototype.toString = model.Key.prototype.toJSON = model.Key.prototype.urlsafe;

/**
 * @expose
 * @type {?model.Key}
 */
model.Key.prototype.parent;

Object.defineProperty(model.Key.prototype, 'parent', {
  /**
   * @expose
   * @type {boolean}
   */
  enumerable: true,

  /**
   * @expose
   * @return {?model.Key}
   * @this {model.Key}
   */
  get: function () {
    return this._parent ? model.Key.registry[this._parent] : null;
  }
});

/**
 * @expose
 * @type {?Array.<model.Key>}
 */
model.Key.prototype.children;

Object.defineProperty(model.Key.prototype, 'children', {
  /**
   * @expose
   * @type {boolean}
   */
  enumerable: true,

  /**
   * @expose
   * @return {?Array.<model.Key>}
   * @this {model.Key}
   */
  get: function () {
    return model.Key.ancestry[this._flat];
  }
});

util.object.extend(model.Key, /** @lends {model.Key} */{
  /**
   * @static
   * @param {(string|model.Key} flat Fully-unpacked flattened key string. If base64 encoded,
   *    will first be decoded. If already a model.Key, will just be returned.
   * @return {model.Key}
   * @throws {TypeError} If <code>flat</code> is not a string or is malformed.
   */
  inflate: function (flat) {
    var parts, id, kind, parent;

    if (flat instanceof model.Key)
      return flat;

    if (typeof flat !== 'string')
      throw new TypeError('model.Key.inflate() expects a key string to inflate.');

    if (flat.indexOf(':') === -1)
      flat = model.Key.decode(flat);

    if (model.Key.registry[flat])
      return model.Key.registry[flat];

    parts = flat.split(':');
    id = parts.pop();
    kind = parts.pop();
    parent = parts.length ? parts.join(':') : null;

    return new model.Key(kind, id, parent);
  },

  /**
   * @static
   * @param {!Array.<string>} packed
   * @param {!Array.<string>} kinds
   * @return {model.KeyList.<model.Key>}
   * @throws {(TypeError|Error)} If either packed or kinds is not an Array, or if a malformed packed
   *    key is encountered.
   */
  unpack: function (packed, kinds) {
    var keys, index;

    if (!(Array.isArray(packed) && Array.isArray(kinds)))
      throw new TypeError('model.Key.unpack() expects a list of packed keys and list of kinds.');

    keys = new model.KeyList();

    packed.forEach(function (parts, i) {
      var kind, id, parent;

      parts = parts.split(':');

      kind = kinds[+parts.shift()];
      id = parts.shift();
      parent = parts.length ? keys[+parts.shift()] : null;

      if (!(kind && id))
        throw new Error('model.Key.unpack() can\'t unpack malformed key: ' + parts);

      keys.push(new model.Key(kind, id, parent));
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
   * @type {Object.<string, model.Key>}
   */
  registry: {},

  /**
   * @static
   * @type {Object}
   */
  ancestry: {
    /**
     * @expose
     * @type {Object.<string, models.KeyList>}
     */
    id: {},

    /**
     * @expose
     * @type {Object.<string, models.KeyList>}
     */
    kind: {}
  }
});


/**
 * Represents a key-bound contextual data object.
 * @constructor
 * @param {!(string|model.Key)} key
 * @param {*} data
 */
model.Model = function (key, data) {
  if (!(key instanceof model.Key)) {
    if (typeof key !== 'string')
      throw new TypeError('model.KeyedItem() expects a model.Key or string key as the first parameter.');

    key = model.Key.inflate(key);
  }

  /**
   * @private
   * @type {!string}
   */
  this.__id__ = key.flatten();

  /**
   * @private
   * @type {Object}
   */
  this.__prop__ = data instanceof model.Model ? data.__prop__ :
    data ? data.data || data : {};

  this.key.bind(this);
};

util.object.mixin(model.Model, /** @lends {model.Model.prototype} */{
  /**
   * Returns value by property name, or call with no arguments to retrieve the full data object.
   * @param {string=} prop
   * @return {Object}
   */
  get: function (prop) {
    return typeof prop === 'string' ? this.__prop__[prop] : this.__prop__;
  },

  /**
   * Sets a value by property name, or sets the whole object.
   * @param {(string|Object)} prop
   * @param {*} value
   */
  set: function (prop, value) {
    if (typeof prop === 'string') {
      this.__prop__[prop] = value;
    } else {
      this.__prop__ = prop || {};
    }
  },

  /**
   * Persists the current Model into the default Key store.
   * @return {model.Model}
   */
  put: function () {
    this.key.put();
    return this.key;
  },

  /**
   * @expose
   * @override
   * @return {Object}
   */
  toJSON: function () {
    return {
      /**
       * @expose
       * @type {string}
       */
      key: this.key.urlsafe(),
      
      /**
       * @expose
       * @type {string}
       */
      kind: this.kind,

      /**
       * @expose
       * @type {Object}
       */
      data: this.__prop__,

      /**
       * @expose
       * @type {?model.Model}
       */
      parent: this.parent ? this.parent.toJSON() : null
    };
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
 * @type {model.Key}
 */
model.Model.prototype.key;

Object.defineProperty(model.Model.prototype, 'key', {
  /**
   * @expose
   * @type {boolean}
   */
  enumerable: true,

  /**
   * @expose
   * @return {model.Key}
   * @this {model.Model}
   */
  get: function () {
    return model.Key.inflate(this.__id__);
  },

  /**
   * @expose
   * @param {(string|model.Key)} key
   * @this {model.Model}
   * @throws {TypeError} If key is not a string or Key.
   */
  set: function (key) {
    if (typeof key === 'string')
      key = model.Key.inflate(key);

    if (!(key instanceof model.Key))
      throw new TypeError('KeyedItem.key must be a string or instanceof model.Key.');

    this.__id__ = key.flatten();
  }
});

/**
 * @expose
 * @type {string}
 */
model.Model.prototype.kind;

Object.defineProperty(model.Model.prototype, 'kind', {
  /**
   * @expose
   * @type {boolean}
   */
  enumerable: true,

  /**
   * @expose
   * @return {string}
   * @this {model.Model}
   */
  get: function () {
    return this.key.kind;
  }
});

/**
 * @expose
 * @type {Object}
 */
model.Model.prototype.data;

Object.defineProperty(model.Model.prototype, 'data', {
  /**
   * @expose
   * @type {boolean}
   */
  enumerable: true,

  /**
   * @expose
   * @return {Object}
   * @this {model.Model}
   */
  get: function () {
    return this.__prop__;
  },

  /**
   * @expose
   * @param {Object=} data
   * @this {model.Model}
   */
  set: function (data) {
    this.__prop__ = this.key.bind(data ? data.data || data : {});
  }
});

/**
 * @expose
 * @type {?model.Model}
 */
model.Model.prototype.parent;

Object.defineProperty(model.Model.prototype, 'parent', {
  /**
   * @expose
   * @type {boolean}
   */
  enumerable: true,

  /**
   * @expose
   * @return {*}
   * @this {?model.Model}
   */
  get: function () {
    return this.key.parent ? this.key.parent.data() : null;
  }
});

util.object.extend(model.Model, /** @lends {model.Model} */{
  /**
   * Accepts a potential data object and returns whether it should be considered valid. Default is
   * a no-op and always passes. Override with custom validation logic on subclasses.
   * @param {*} data
   * @return {boolean}
   */
  validate: function (data) {
    return true;
  }
});


/**
 * @constructor
 * @extends {Array}
 * @param {(number|model.KeyedItem)=} length
 * @param {...[model.KeyedItem]} item
 */
model.KeyIndexedList = function (length, item) {
  Array.apply(this, arguments);

  /**
   * @type {Object.<string, number>}
   */
  this.index = {};
};

util.object.inherit(model.KeyIndexedList, Array);

util.object.mixin(model.KeyIndexedList, /** @lends {model.KeyIndexedList.prototype} */{
  /**
   * @param {(model.KeyedItem|function(*): string)} item
   * @return {string|model.KeyIndexedList}
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
   * @param {(number|string|model.Key)} key
   * @return {?model.KeyedItem}
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
   * @param {!(string|model.Key)} key
   * @return {boolean}
   * @throws {TypeError} If key is not a string or model.Key.
   */
  has: function (key) {
    if (!(typeof key === 'string' || key instanceof model.Key))
      throw new TypeError('model.KeyIndexedList.has() expects a string key or instance of model.Key.');

    return typeof this.index[key] === 'number';
  },

  /**
   * @param {function(model.KeyedItem): boolean} query
   * @return {?model.KeyedItem}
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
   * @param {...[model.KeyedItem]} item
   * @return {?number}
   */
  push: function (item) {
    /*jshint eqnull: true */
    var key = this.key(item),
      i, _i, _item;

    if (!key) {
      console.warn('model.KeyIndexedList.push() only accepts model.KeyedItems.');
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
   * @param {...[model.KeyedItem]} item
   * @return {?number}
   */
  unshift: function (item) {
    /*jshint eqnull:true */
    var key = this.key(item),
      len = arguments.length,
      newItems = [],
      i, _item, _i;

    if (!key) {
      console.warn('model.KeyIndexedList.unshift() only accepts model.KeyedItems.');
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
   * @return {?model.KeyedItem}
   */
  pop: function () {
    var item = Array.prototype.pop.call(this);

    if (item)
      this.index[this.key(item)] = null;

    return item;
  },

  /**
   * @override
   * @return {?model.KeyedItem}
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
   * @return {Array.<model.KeyedItem>}
   */
  splice: function (index, remove, item) {
    var list = this;
    return Array.prototype.splice.apply(this, arguments).map(function (item) {
      list.index[list.key(item)] = null;
      return item;
    });
  },

  /**
   * @param {(model.KeyIndexedList|Array.<model.KeyedItem>)} list
   * @return {model.KeyIndexedList}
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
 * @extends {model.KeyIndexedList}
 * @param {(number|model.KeyedItem)=} length
 * @param {...[model.KeyedItem]} item
 */
model.KeyList = function (length, item) {
  model.KeyIndexedList.apply(this, arguments);
};

util.object.inherit(model.KeyList, model.KeyIndexedList);

util.object.mixin(model.KeyList, /** @lends {model.KeyList.prototype} */{
  /**
   * @override
   * @param {(model.KeyedItem|function(*): string)} item
   * @return {string}
   */
  key: function (item) {
    return String(item);
  }
});
