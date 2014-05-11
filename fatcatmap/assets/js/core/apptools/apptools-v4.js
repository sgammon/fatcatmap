(function() {
  var AnimationInterface, AppTools, AppToolsDriver, AppToolsException, CoreAPI, CoreAgentAPI, CoreDevAPI, CoreDriver, CoreEventsAPI, CoreException, CoreInterface, CoreModelAPI, CoreObject, CoreRPCAPI, CoreRenderAPI, CoreServicesAPI, CoreStorageAPI, DOMInterface, Driver, GoogleAnalytics, Interface, Key, KeyEncoder, ListField, LocalStorageDriver, LocalStorageEngine, Model, ModelException, NativeSocket, NativeXHR, QueryInterface, RPC, RPCAPI, RPCContext, RPCEnvelope, RPCErrorResponse, RPCInterface, RPCPromise, RPCRequest, RPCResponse, RealtimeDriver, RenderException, RenderInterface, RequestEnvelope, ResponseEnvelope, ServiceLayerDriver, SessionStorageDriver, SessionStorageEngine, SimpleKeyEncoder, SocketCommands, StorageAdapter, StorageDriver, Template, TemplateAPI, TemplateLoader, TransportInterface, Util, boot, i, __apptools_preinit_bootlist, _i, _j, _len, _len1, _ref, _simple_key_encoder,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __slice = [].slice,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
    _this = this,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  __apptools_preinit_bootlist = ['installed_drivers', 'installed_integrations', 'abstract_base_classes', 'abstract_feature_interfaces', 'deferred_core_modules', 'deferred_library_integrations'];

  this.__apptools_preinit = {};

  for (_i = 0, _len = __apptools_preinit_bootlist.length; _i < _len; _i++) {
    boot = __apptools_preinit_bootlist[_i];
    this.__apptools_preinit[boot] = [];
  }

  CoreAPI = (function() {

    CoreAPI.prototype.install = function(window, i) {
      if (window.apptools != null) {
        window.apptools.sys.modules.install(i);
      }
      window.__apptools_preinit.deferred_core_modules.push(i);
      return i;
    };

    function CoreAPI(apptools, window) {
      if ((apptools != null ? apptools.events : void 0) != null) {
        this.events = apptools.events;
      }
      return;
    }

    return CoreAPI;

  })();

  window.CoreAPI = CoreAPI;

  CoreObject = (function() {

    function CoreObject() {}

    CoreObject.prototype.install = function(window, i) {
      window.__apptools_preinit.abstract_base_classes.push(i);
      return i;
    };

    return CoreObject;

  })();

  window.CoreObject = CoreObject;

  CoreDriver = (function(_super) {

    __extends(CoreDriver, _super);

    CoreDriver.prototype.name = null;

    CoreDriver.prototype.library = null;

    CoreDriver.prototype["interface"] = [];

    function CoreDriver(apptools) {
      this;

    }

    CoreDriver.prototype.install = function(window, i) {
      if (window.apptools != null) {
        window.apptools.sys.drivers.install(i);
      }
      window.__apptools_preinit.installed_drivers.push(i);
      window[i.name] = i;
      return i;
    };

    return CoreDriver;

  })(CoreObject);

  window.CoreDriver = CoreDriver;

  CoreInterface = (function(_super) {

    __extends(CoreInterface, _super);

    CoreInterface.prototype.parent = null;

    CoreInterface.prototype.required = [];

    CoreInterface.prototype.capability = null;

    CoreInterface.prototype["static"] = true;

    function CoreInterface(apptools) {
      this.drivers = {
        adapters: {},
        priority: [],
        selected: null
      };
    }

    CoreInterface.prototype.install = function(window, i) {
      if (window.apptools != null) {
        window.apptools.sys.interfaces.install(i);
      }
      window.__apptools_preinit.abstract_feature_interfaces.push(i);
      window[i.name] = i;
      return i;
    };

    CoreInterface.prototype.add = function(driver) {
      this.drivers.adapters[driver.name] = driver;
      this.drivers.priority.push(driver.name);
    };

    CoreInterface.prototype.resolve = function(name) {
      var driver, start_p, _j, _len1, _ref;
      if (name != null) {
        if (this.drivers.adapters[name] != null) {
          return this.drivers.adapters[name];
        }
        return false;
      }
      if (this["static"] && (this.drivers.selected != null)) {
        return this.drivers.adapters[this.drivers.selected];
      } else {
        start_p = -1;
        _ref = this.drivers.priority;
        for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
          driver = _ref[_j];
          if ((driver.priority != null) && driver.priority > start_p) {
            this.drivers.selected = driver;
          } else {
            if (!(driver.priority != null)) {
              this.drivers.selected = driver;
            }
            continue;
          }
        }
        if (this.drivers.selected === null) {
          return false;
        }
        return this.drivers.adapters[this.drivers.selected];
      }
    };

    return CoreInterface;

  })(CoreObject);

  window.CoreInterface = CoreInterface;

  CoreException = (function(_super) {

    __extends(CoreException, _super);

    function CoreException(module, message, context) {
      this.module = module;
      this.message = message;
      this.context = context;
    }

    CoreException.prototype.toString = function() {
      return '[' + this.module + '] CoreException: ' + this.message;
    };

    CoreException.prototype.install = function(window, i) {
      window.__apptools_preinit.abstract_base_classes.push(i);
      return i;
    };

    return CoreException;

  })(Error);

  window.CoreException = CoreException;

  AppToolsDriver = (function(_super) {

    __extends(AppToolsDriver, _super);

    function AppToolsDriver() {
      return AppToolsDriver.__super__.constructor.apply(this, arguments);
    }

    return AppToolsDriver;

  })(CoreDriver);

  AppToolsException = (function(_super) {

    __extends(AppToolsException, _super);

    function AppToolsException() {
      return AppToolsException.__super__.constructor.apply(this, arguments);
    }

    return AppToolsException;

  })(CoreException);

  window.AppToolsDriver = AppToolsDriver;

  window.AppToolsException = AppToolsException;

  Driver = (function(_super) {

    __extends(Driver, _super);

    function Driver() {
      return Driver.__super__.constructor.apply(this, arguments);
    }

    return Driver;

  })(CoreDriver);

  Interface = (function(_super) {

    __extends(Interface, _super);

    function Interface() {
      return Interface.__super__.constructor.apply(this, arguments);
    }

    return Interface;

  })(CoreInterface);

  window.Driver = Driver;

  window.Interface = Interface;

  this.__apptools_preinit.abstract_base_classes.push(CoreAPI, CoreObject, CoreInterface, CoreDriver, CoreException, AppToolsException, Driver, Interface);

  /*
  Handy utility functions.
  You're welcome.

  david@momentum.io
  */


  Util = (function() {

    Util.mount = 'util';

    Util.events = ['DOM_READY'];

    function Util() {
      var _this = this;
      if (arguments.length > 0) {
        return _.get.apply(_, arguments);
      }
      if ((window._ != null) && (window._.resolve_common_ancestor != null)) {
        return window._;
      }
      this._state = {
        active: null,
        init: false,
        dom_status: null,
        dom_ready: false,
        queues: {
          fx: [],
          dom: [],
          deferred: [],
          ready: [],
          "default": []
        },
        counts: {
          fx: 0,
          dom: 0,
          deferred: 0,
          ready: 0,
          "default": 0
        },
        handlers: {
          "default": function(q) {
            console.log('Default queue handler called on Util, returning queue: ', q);
            return q;
          },
          ready: function(e) {
            if (document.readyState = 'complete') {
              document.removeEventListener('DOMContentLoaded', _this._state.handlers.ready, false);
              _this._state.dom_ready = true;
              _this._state.dom_status = 'READY';
              return $.apptools.events.trigger('DOM_READY');
            }
          }
        },
        callbacks: {
          "default": null
        }
      };
      this.internal = {
        queues: {
          create: function(name, fn, callback_type) {
            if (callback_type == null) {
              callback_type = 'handler';
            }
            callback_type += 's';
            _this._state.queues[name] = [];
            _this._state.counts[name] = 0;
            _this._state[callback_type][name] = fn;
          },
          remove: function(name, callback) {
            var handler, q, response;
            handler = _this._state.handlers[name];
            delete _this._state.handlers[name];
            q = _this._state.queues[name];
            delete _this._state.queues[name];
            response = q.length > 0 ? {
              queue: q,
              handler: handler
            } : true;
            if (callback != null) {
              return callback(response);
            } else {
              return response;
            }
          },
          add: function(name, item) {
            if (!(item != null)) {
              item = name;
              name = 'default';
            }
            _this._state.queues[name].push(item);
            return _this._state.counts[name]++;
          },
          set_handler: function(name, handler) {
            return _this._state.handlers[name] = handler;
          },
          set_callback: function(name, callback) {
            return _this._state.callbacks[name] = callback;
          },
          go: function(name, q_or_item) {
            var item, q;
            _this._state.counts[name]--;
            if (_this._state.handlers[name] && _this.is_array(q_or_item)) {
              q = q_or_item;
              return _this._state.handlers[name](q);
            } else if (_this._state.callbacks[name]) {
              item = q_or_item;
              return _this._state.callbacks[name](item);
            } else {
              if (_this.is_function(q_or_item)) {
                return q_or_item.call(window, window);
              } else {
                return q_or_item;
              }
            }
          },
          process: function(name) {
            var q, results, _j, _len1, _q;
            q = _this._state.queues[name];
            _this._state.queues[name] = [];
            results = [];
            for (_j = 0, _len1 = q.length; _j < _len1; _j++) {
              _q = q[_j];
              results.push(_this.internal.queues.go(name, _q));
            }
            return results;
          }
        }
      };
      this.is = function(thing) {
        return !_this.in_array([false, null, NaN, void 0, 0, {}, [], '', 'false', 'False', 'null', 'NaN', 'undefined', '0', 'none', 'None'], thing);
      };
      this.has = function(object, property) {
        return {}.hasOwnProperty.call(object, property);
      };
      this.is_function = function(object) {
        return _this.type_of(object) === 'function';
      };
      this.is_object = function(object) {
        return _this.type_of(object) === 'object';
      };
      this.is_raw_object = function(object) {
        if (!object || _this.type_of(object) !== 'object' || object.nodeType || _this.is_window(object)) {
          return false;
        }
        if ((object.constructor != null) && !object.hasOwnProperty('constructor') && !object.constructor.prototype.hasOwnProperty('isPrototypeOf')) {
          return false;
        }
        return true;
      };
      this.is_empty_object = function(object) {
        var key;
        for (key in object) {
          return false;
        }
        return true;
      };
      this.is_window = function(object) {
        return !!object.setInterval || ((object.self != null) && object.self === object) || ((typeof Window !== "undefined" && Window !== null) && object instanceof Window);
      };
      this.is_body = function(object) {
        return _this.is_object(object) && (Object.prototype.toString.call(object) === '[object HTMLBodyElement]' || object.constructor.name === 'HTMLBodyElement');
      };
      this.is_array = Array.isArray || function(object) {
        return _this.type_of(object) === 'array';
      };
      this.is_string = function(string) {
        return _this.type_of(string) === 'string';
      };
      this.attr = function(element, key, data) {
        if (!key || !element) {
          return false;
        }
        if (data != null) {
          element.setAttribute(key, data);
          return element;
        } else {
          return element.getAttribute(key);
        }
      };
      this.data = function(element, key, data) {
        var attr, attrs, k, name, re, v, value, _j, _len1;
        if (element == null) {
          element = document;
        }
        re = /^data-(\w*)$/;
        if (!(key != null) && !(data != null)) {
          data = {};
          attrs = element.attributes;
          for (_j = 0, _len1 = attrs.length; _j < _len1; _j++) {
            attr = attrs[_j];
            if (re.test(attr.name)) {
              name = re.exec(attr.name)[1];
              data[name] = _this.data(element, name);
            }
          }
          return (_this.is_empty_object(data) ? null : data);
        }
        if (_this.is_raw_object(key)) {
          for (k in key) {
            v = key[k];
            _this.data(element, k, v);
          }
          return element;
        }
        key = re.test(key) ? key : 'data-' + key;
        if (data != null) {
          if (data === false) {
            return element.removeAttribute(key);
          }
          if (_this.is_object(data) || _this.is_array(data)) {
            data = _this.JSON_to_safe(JSON.stringify(data));
          }
          element.setAttribute(key, data);
          return element;
        } else {
          value = element.getAttribute(key) || false;
          if (!!value) {
            if (_this.is_JSON(value)) {
              return JSON.parse(_this.safe_to_JSON(value));
            } else {
              return value;
            }
          } else {
            return null;
          }
        }
      };
      this.is_JSON = function(string) {
        return _this.is_string(string) && /[\{\[](?:.*)[\}\]]/.test(string);
      };
      this.JSON_to_safe = function(json) {
        return json.split('"').join('\'');
      };
      this.safe_to_JSON = function(safe) {
        return safe.split('\'').join('"');
      };
      this.in_array = function(array, item) {
        return !!~_this.indexOf(array, item);
      };
      this.to_array = function(node_or_token_list) {
        var array;
        if (!node_or_token_list) {
          return false;
        }
        if (_this.is_array(node_or_token_list)) {
          return node_or_token_list;
        }
        if (!(node_or_token_list.length != null)) {
          return [node_or_token_list];
        }
        array = [];
        for (i = node_or_token_list.length; i--; array.unshift(node_or_token_list[i]));

        return array;
      };
      this.join = function() {
        var it, item, items, newitems, _j, _k, _len1, _len2;
        items = _this.to_array(arguments);
        newitems = [];
        for (_j = 0, _len1 = items.length; _j < _len1; _j++) {
          item = items[_j];
          item = _this.to_array(item);
          for (_k = 0, _len2 = item.length; _k < _len2; _k++) {
            it = item[_k];
            newitems.push(it);
            continue;
          }
          continue;
        }
        return newitems;
      };
      this.indexOf = function(arr, item) {
        var i, key, result, val;
        if (_this.is_array(arr)) {
          if ((_i = Array.prototype.indexOf) != null) {
            return _i.call(arr, item);
          } else {
            i = arr.length;
            while (i--) {
              if (arr[i] === item) {
                return i;
              }
            }
            return -1;
          }
        } else if (_this.is_object(arr)) {
          result = -1;
          for (key in arr) {
            if (!__hasProp.call(arr, key)) continue;
            val = arr[key];
            if (val !== item) {
              continue;
            }
            result = key;
            break;
          }
          return result;
        } else {
          throw 'indexOf() requires an iterable as the first parameter';
        }
      };
      this.each = function(arr, fn, ctx) {
        var i, item, k, results, val, _e, _j, _len1;
        if (ctx == null) {
          ctx = window;
        }
        if (_this.type_of(fn) !== 'function') {
          throw 'each() requires an iterator as the second parameter';
        } else {
          results = [];
          if (_this.is_array(arr)) {
            if ((_e = Array.prototype.forEach) != null) {
              return _e.call(arr, fn, ctx);
            }
            for (i = _j = 0, _len1 = arr.length; _j < _len1; i = ++_j) {
              item = arr[i];
              results.push(fn.call(ctx, item, i, arr));
            }
          } else if (_this.is_object(arr)) {
            for (k in arr) {
              val = arr[k];
              results.push(fn.call(ctx, val, k, arr));
            }
          } else {
            throw 'each() requires an iterable as the first parameter';
          }
        }
      };
      this.map = function(arr, fn, ctx) {
        var i, item, k, results, val, _j, _len1, _m;
        if (ctx == null) {
          ctx = window;
        }
        if (_this.type_of(fn) !== 'function') {
          throw 'map() requires an iterator as the second parameter';
        } else {
          if (_this.is_array(arr)) {
            if ((_m = Array.prototype.map) != null) {
              return _m.call(arr, fn, ctx);
            }
            results = [];
            for (i = _j = 0, _len1 = arr.length; _j < _len1; i = ++_j) {
              item = arr[i];
              results.push(fn.call(ctx, item, i, arr));
            }
          } else if (_this.is_object(arr)) {
            results = {};
            for (k in arr) {
              if (!__hasProp.call(arr, k)) continue;
              val = arr[k];
              results[k] = fn.call(ctx, val, k, arr);
            }
          } else {
            throw 'map() requires an iterable as the first parameter';
          }
          return results;
        }
      };
      this.filter = function(arr, fn, ctx) {
        var i, item, k, results, val, _f, _j, _len1;
        if (ctx == null) {
          ctx = window;
        }
        if (_this.type_of(fn) !== 'function') {
          throw 'filter() requires an iterator as the second parameter';
        } else {
          if (_this.is_array(arr)) {
            if ((_f = Array.prototype.filter) != null) {
              return _f.call(arr, fn, ctx);
            }
            results = [];
            for (i = _j = 0, _len1 = arr.length; _j < _len1; i = ++_j) {
              item = arr[i];
              if (fn.call(ctx, item, i, arr)) {
                results.push(item);
              }
            }
          } else if (_this.is_object(arr)) {
            results = {};
            for (k in arr) {
              if (!__hasProp.call(arr, k)) continue;
              val = arr[k];
              if (fn.call(ctx, val, k, arr)) {
                results[k] = val;
              }
            }
          } else {
            throw 'filter() requires an iterable as the first parameter';
          }
          return results;
        }
      };
      this.reject = function(arr, fn, ctx) {
        var i, item, k, results, val, _j, _len1;
        if (ctx == null) {
          ctx = window;
        }
        if (_this.type_of(fn) !== 'function') {
          throw 'reject() requires an iterator as the second parameter';
        } else {
          if (_this.is_array(arr)) {
            results = [];
            for (i = _j = 0, _len1 = arr.length; _j < _len1; i = ++_j) {
              item = arr[i];
              if (!fn.call(ctx, item, i, arr)) {
                results.push(item);
              }
            }
          } else if (_this.is_object(arr)) {
            results = {};
            for (k in arr) {
              if (!__hasProp.call(arr, k)) continue;
              val = arr[k];
              if (!fn.call(ctx, val, k, arr)) {
                results[k] = val;
              }
            }
          } else {
            throw 'reject() requires an iterable as the first parameter';
          }
          return results;
        }
      };
      this.exclude = function(array, excludes) {
        var item, k, results, v, _j, _len1;
        if (_this.is_array(array)) {
          results = [];
          for (_j = 0, _len1 = array.length; _j < _len1; _j++) {
            item = array[_j];
            if (!!!~_this.indexOf(excludes, item)) {
              results.push(item);
            }
          }
        } else if (_this.is_object(array)) {
          results = {};
          for (k in array) {
            v = array[k];
            if (!!!~_this.indexOf(excludes, k)) {
              results[k] = v;
            }
          }
        } else {
          throw 'exclude() requires two iterables';
        }
        return results;
      };
      this.all = function(arr, fn, ctx) {
        var key, results, _all, _arr, _obj, _results;
        if (ctx == null) {
          ctx = window;
        }
        if (_this.type_of(fn) !== 'function') {
          throw 'all() requires an iterator as the second parameter';
        } else {
          if ((_arr = _this.is_array(arr)) || (_obj = _this.is_object(arr))) {
            if (_arr) {
              if ((_all = Array.prototype.every) != null) {
                return _all.call(arr, fn, ctx);
              }
            }
            results = _this.reject(arr, fn, ctx);
            if (_arr) {
              return results.length === 0;
            } else {
              _results = [];
              for (key in _obj) {
                _results.push(false);
              }
              return _results;
            }
          } else {
            throw 'all() requires an iterable as the first parameter';
          }
        }
      };
      this.any = function(arr, fn, ctx) {
        var key, results, _any, _arr, _obj, _results;
        if (ctx == null) {
          ctx = window;
        }
        if (_this.type_of(fn) !== 'function') {
          throw 'any() requires an iterator as the second parameter';
        } else {
          if ((_arr = _this.is_array(arr)) || (_obj = _this.is_object(arr))) {
            if (_arr) {
              if ((_any = Array.prototype.some) != null) {
                return _any.call(arr, fn, ctx);
              }
            }
            results = _this.filter(arr, fn, ctx);
            if (_arr) {
              return results.length > 0;
            } else {
              _results = [];
              for (key in _obj) {
                _results.push(true);
              }
              return _results;
            }
          } else {
            throw 'any() requires an iterable as the first parameter';
          }
        }
      };
      this.reduce = function(arr, fn, initial, ctx) {
        var item, results, _j, _len1, _r;
        if (ctx == null) {
          ctx = window;
        }
        if (initial == null) {
          initial = _this.is_array(arr[0]) ? [] : 0;
        }
        if (_this.type_of(fn) !== 'function') {
          throw 'reduce() requires an iterator as the second parameter';
        } else {
          if (_this.is_array(arr)) {
            if ((_r = Array.prototype.reduce) != null) {
              return _r.call(arr, fn, initial, ctx);
            }
            results = initial;
            for (_j = 0, _len1 = arr.length; _j < _len1; _j++) {
              item = arr[_j];
              fn.call(ctx, results, item, arr);
            }
            return results;
          } else {
            throw 'reduce() requires an array as the first parameter';
          }
        }
      };
      this.reduce_right = function(arr, fn, initial, ctx) {
        var last;
        if (ctx == null) {
          ctx = window;
        }
        if (initial == null) {
          initial = _this.is_array(arr[last = arr.length - 1]) ? [] : 0;
        }
        if (_this.type_of(fn) !== 'function') {
          throw 'reduce_right() requires an iterator as the second parameter';
        } else {
          if (_this.is_array(arr)) {
            return _this.reduce(arr.reverse(), fn, initial, ctx);
          } else {
            throw 'reduce_right() requires an array as the first parameter';
          }
        }
      };
      this.sort = function(arr, fn) {
        var _s;
        if ((fn != null) && _this.type_of(fn) !== 'function') {
          throw 'sort() requires an iterator as the second parameter';
        } else if ((_s = Array.prototype.sort) != null) {
          return _s.call(arr, fn);
        } else {
          console.log('non-native sort() currently stubbed.');
          return false;
        }
      };
      this.defaults = function(obj, def_obj) {
        var i, k, new_obj, o, v, _j, _len1;
        if (def_obj == null) {
          def_obj = {};
        }
        new_obj = obj;
        if (_this.is_array(obj)) {
          for (i = _j = 0, _len1 = obj.length; _j < _len1; i = ++_j) {
            o = obj[i];
            if (!(o != null)) {
              new_obj[i] = def_obj[i];
            }
          }
        } else if (_this.is_object(obj)) {
          for (k in obj) {
            v = obj[k];
            if (!(v != null)) {
              new_obj[k] = def_obj[k];
            }
          }
        } else {
          throw 'Defaults requires an iterable as the first param.';
        }
        return new_obj;
      };
      this.first = function(array) {
        var arr;
        arr = array.slice();
        return arr.shift();
      };
      this.last = function(array) {
        var arr;
        arr = array.slice();
        return arr.pop();
      };
      this.purge = function(array) {
        return _this.filter(array, function(it) {
          return _this.is(it);
        });
      };
      this.empties = function(array) {
        var idxs;
        idxs = [];
        _.each(array, function(it, i) {
          if (!_this.is(it)) {
            idxs.push(i);
          }
        });
        return idxs;
      };
      this.create_element_string = function(tag, attrs, separator, ext) {
        var el_str, k, no_close, v;
        if (separator == null) {
          separator = '*';
        }
        no_close = ['area', 'base', 'basefont', 'br', 'col', 'frame', 'hr', 'img', 'input', 'link'];
        tag = tag.toLowerCase();
        el_str = '<' + tag;
        for (k in attrs) {
          v = attrs[k];
          el_str += ' ' + k + '=' + '"' + (_this.is_JSON(v) ? _this.JSON_to_safe(v) : (_this.is_raw_object(v) || _this.is_array(v) ? _this.JSON_to_safe(JSON.stringify(v)) : v)) + '"';
        }
        if (ext != null) {
          el_str += ' ' + ext;
        }
        el_str += '>';
        if (!_this.in_array(no_close, tag)) {
          el_str += separator + '</' + tag + '>';
        }
        return el_str;
      };
      this.create_doc_frag = function(html) {
        var arg, frag, html_string, range, _j, _len1;
        if (arguments.length > 1) {
          html_string = '';
          for (_j = 0, _len1 = arguments.length; _j < _len1; _j++) {
            arg = arguments[_j];
            html_string += arg;
          }
        } else {
          html_string = html;
        }
        range = document.createRange();
        range.selectNode(document.getElementsByTagName('div').item(0));
        frag = range.createContextualFragment(html_string);
        return frag;
      };
      this.to_doc_frag = function(node) {
        var frag;
        frag = document.createDocumentFragment();
        frag.appendChild(node);
        return frag;
      };
      this.add = function(tag, attrs, parent) {
        var handler, node_id, q_name;
        if (parent == null) {
          parent = document.body;
        }
        if (!(tag != null) || !_this.is_object(attrs)) {
          return false;
        }
        handler = _this.debounce(function(response) {
          var args, dfrag, html, q, _j, _len1;
          q = response;
          parent = parent;
          html = [];
          for (_j = 0, _len1 = q.length; _j < _len1; _j++) {
            args = q[_j];
            html.push(_this.create_element_string.apply(_this, args));
          }
          dfrag = _this.create_doc_frag(html.join(''));
          return parent.appendChild(dfrag);
        }, 500, false);
        q_name = _this.is_body(parent) || !(parent != null) || !(node_id = parent.getAttribute('id')) ? 'dom' : node_id;
        if (!(_this._state.queues[q_name] != null)) {
          _this.internal.queues.create(q_name, {
            handler: handler
          });
        } else if (!(_this._state.handlers[q_name] != null)) {
          _this.internal.queues.add_handler(q_name, handler);
        }
        _this.internal.queues.add(q_name, [tag, attrs]);
        return _this.internal.queues.process(q_name);
      };
      this.insert = function(parent, node) {
        return parent.appendChild(node);
      };
      this.remove = function(node) {
        return node.parentNode.removeChild(node);
      };
      this.get = function(query, node) {
        var cls, id, selector, tg, _ref;
        if (node == null) {
          node = document;
        }
        if (!(query != null) || !_this.type_of(query) === 'string') {
          return false;
        }
        if (query.nodeType) {
          return query;
        }
        if (_this.is_array(query)) {
          query = query[0];
        }
        if (node.setInterval != null) {
          node = document;
        }
        if (_this.in_array(['.', '#'], query[0])) {
          _ref = [query.charAt(0), Array.prototype.slice.call(query, 1).join('')], selector = _ref[0], query = _ref[1];
          return (selector === '#' ? document.getElementById(query) : _this.to_array(node.getElementsByClassName(query)));
        } else {
          if ((id = document.getElementById(query)) != null) {
            return id;
          }
          if ((cls = node.getElementsByClassName(query)).length > 0) {
            return (cls.length > 1 ? _this.to_array(cls) : cls[0]);
          }
          if ((tg = node.getElementsByTagName(query)).length > 0) {
            return (tg.length > 1 ? _this.to_array(tg) : tg[0]);
          }
          return null;
        }
      };
      this.val = function(element, data) {
        if (data != null) {
          if (element.value) {
            element.value = data;
          } else {
            element.innerText = data;
          }
          return element;
        } else {
          return (element.value ? element.value : element.innerText);
        }
      };
      this.html = function(element, data) {
        if (data != null) {
          element.innerHTML = data;
          return element;
        } else {
          return element.innerHTML;
        }
      };
      this.get_offset = function(elem) {
        var offL, offT;
        offL = offT = 0;
        while (true) {
          offL += elem.offsetLeft;
          offT += elem.offsetTop;
          if (!(elem = elem.offsetParent)) {
            break;
          }
        }
        return {
          left: offL,
          top: offT
        };
      };
      this.has_class = function(element, cls) {
        var _ref;
        return ((_ref = element.classList) != null ? _ref.contains(cls) : void 0) || element.className && new RegExp('\\s*' + cls + '\\s*').test(element.className);
      };
      this.add_class = function(element, cls) {
        if (element.classList) {
          element.classList.add(cls);
        } else {
          element.className += ' ' + cls;
        }
        return element;
      };
      this.remove_class = function(element, cls) {
        if (element.classList) {
          element.classList.remove(cls);
        } else {
          element.className.replace(new RegExp('\\s*' + cls + '\\s*'), ' ').replace(/\s{2}/g, ' ');
        }
        return element;
      };
      this.is_id = function(str) {
        if (str.charAt(0) === '#') {
          return true;
        }
        if (document.getElementById(str) !== null) {
          return true;
        }
        return false;
      };
      this.is_child = function(parent, child) {
        var result, results;
        result = false;
        if (_this.is_array(child)) {
          results = _.reject(_.map(child, function(ch) {
            return _this.is_child(parent, ch);
          }), function(r) {
            return r;
          });
          result = results.length === 0;
        } else {
          while (child = child.parentNode) {
            if (child !== parent) {
              continue;
            }
            result = true;
            break;
          }
        }
        return result;
      };
      this.children = function(element) {
        return _this.to_array(element.childNodes);
      };
      this.find_parent = function(child, query) {
        var r;
        return ((r = (_this.filter([_this.get(query)], function(res) {
          return _this.is_child(res, child);
        })[0])) != null ? r : null);
      };
      this.resolve_common_ancestor = function(elem1, elem2, bound_elem) {
        var go1, go2, match, searched_elems;
        if (bound_elem == null) {
          bound_elem = document.body;
        }
        if (!_this.is_child(bound_elem, [elem1, elem2])) {
          throw 'Bounding node must contain both search elements';
        } else {
          searched_elems = [];
          match = null;
          go1 = true;
          go2 = true;
          while (go1 || go2) {
            if (go1) {
              if (_this.in_array(searched_elems, elem1)) {
                match = elem1;
                break;
              } else {
                searched_elems.push(elem1);
                go1 = (elem1 !== bound_elem) && (elem1 = elem1.parentNode) && (elem1 != null);
              }
            }
            if (go2) {
              if (_this.in_array(searched_elems, elem2)) {
                match = elem2;
                break;
              } else {
                searched_elems.push(elem2);
                go2 = (elem2 !== bound_elem) && (elem2 = elem2.parentNode) && (elem2 != null);
              }
            }
            continue;
          }
          return match;
        }
      };
      this.bind = function(element, event, fn, prop) {
        var a, el, ev, k, v, _j, _k, _len1, _len2, _ref;
        if (prop == null) {
          prop = false;
        }
        if (!(element != null) || !(event != null)) {
          return false;
        }
        if (_this.is_window(element) || element.nodeType || ((a = _this.is_array(element)) && element.length > 0 && element[0].nodeType)) {
          if (_this.is_raw_object(event)) {
            for (k in event) {
              v = event[k];
              element.addEventListener(k, v, prop);
            }
            return;
          }
          if (a) {
            if (!_this.is_array(event)) {
              event = [event];
            }
            for (_j = 0, _len1 = event.length; _j < _len1; _j++) {
              ev = event[_j];
              for (_k = 0, _len2 = element.length; _k < _len2; _k++) {
                el = element[_k];
                el.addEventListener(ev, fn, prop);
              }
            }
          } else {
            return element.addEventListener(event, fn, prop);
          }
        } else {
          _ref = [element, event, fn], event = _ref[0], fn = _ref[1], prop = _ref[2];
          return (_this.is_function(fn) ? $.apptools.events.hook(event, fn, prop) : $.apptools.events.bridge(event, fn, prop));
        }
      };
      this.bridge = function() {
        return _this.bind.apply(_this, arguments);
      };
      this.trigger = function() {
        return $.apptools.events.trigger.apply($.apptools.events, arguments);
      };
      this.unbind = function(element, event) {
        var el, ev, evt, _el, _j, _k, _len1, _len2;
        if (!(element != null)) {
          return false;
        }
        if (_this.is_array(element)) {
          for (_j = 0, _len1 = element.length; _j < _len1; _j++) {
            el = element[_j];
            _this.unbind(el, event);
          }
        } else if (_this.is_array(event)) {
          for (_k = 0, _len2 = event.length; _k < _len2; _k++) {
            ev = event[_k];
            _this.unbind(element, ev);
          }
        } else if (_this.is_raw_object(element)) {
          for (_el in element) {
            evt = element[_el];
            _this.unbind(_el, evt);
          }
        } else if (element.constructor.name === 'NodeList') {
          return _this.unbind(_this.to_array(element), event);
        } else {
          return element.removeEventListener(event);
        }
      };
      this.block = function(async_method, object) {
        var result, _done;
        if (object == null) {
          object = {};
        }
        console.log('[Util]', 'Enforcing blocking at user request... :(');
        _done = false;
        result = null;
        async_method(object, function(x) {
          result = x;
          return _done = true;
        });
        while (true) {
          if (_done !== false) {
            break;
          }
        }
        return result;
      };
      this.defer = function(fn, timeout) {
        var tid;
        if (!(timeout != null)) {
          return _this.ready(fn);
        } else if (parseInt(timeout).toString() === 'NaN') {
          return false;
        } else {
          tid = setTimeout(fn, timeout);
          return tid;
        }
      };
      this.ready = function(fn) {
        if (!(_this._state.dom_status != null)) {
          _this._state.dom_status = 'NOT_READY';
          _this.bind('DOM_READY', _this.ready);
          document.addEventListener('DOMContentLoaded', _this._state.handlers.ready, false);
        }
        if (!(fn != null) && _this._state.dom_ready) {
          return _this.internal.queues.process('ready');
        } else if (_this.is_function(fn)) {
          _this.internal.queues.add('ready', fn);
          if (document.readyState === 'complete' && _this._state.dom_ready === true) {
            return _this.defer(_this.ready, 1);
          } else {

          }
        }
      };
      this.now = function() {
        return +new Date();
      };
      this.timestamp = function(d) {
        if (d == null) {
          d = new Date();
        }
        return [[d.getMonth() + 1, d.getDate(), d.getFullYear()].join('-'), [d.getHours(), d.getMinutes(), d.getSeconds()].join(':')].join(' ');
      };
      this.prep_animation = function(t, e, c) {
        var options;
        options = !(t != null) ? {
          duration: 400
        } : (t != null) && _this.is_object(t) ? _this.extend({}, t) : {
          complete: c || (!c && e) || (_this.is_function(t) && t),
          duration: t,
          easing: (c && e) || (e && !is_function(e))
        };
        return options;
      };
      this.throttle = function(fn, buffer, prefire) {
        var last, timer_id;
        if (prefire == null) {
          prefire = false;
        }
        timer_id = null;
        last = 0;
        return function() {
          var args, clear, elapsed, go;
          args = _this.to_array(arguments);
          elapsed = _this.now() - last;
          clear = function() {
            go();
            return timer_id = null;
          };
          go = function() {
            last = _this.now();
            return fn.apply(window, args);
          };
          if (prefire && !timer_id) {
            go();
          }
          if (!!timer_id) {
            clearTimeout(timer_id);
          }
          if (!prefire && elapsed >= buffer) {
            return go();
          } else {
            return timer_id = setTimeout((prefire ? clear : go), !prefire ? buffer - elapsed : buffer);
          }
        };
      };
      this.debounce = function(fn, buffer, prefire) {
        if (buffer == null) {
          buffer = 200;
        }
        if (prefire == null) {
          prefire = false;
        }
        return this.throttle(fn, buffer, prefire);
      };
      this.currency = function(num) {
        var _char, index, len, new_nums, nums, process, _j, _len1;
        len = (nums = String(num).split('').reverse()).length;
        new_nums = [];
        process = function(c, i) {
          var sym;
          if ((i + 1) % 3 === 0 && len - i > 1) {
            sym = ',';
          } else if (i === len - 1) {
            sym = '$';
          } else {
            sym = '';
          }
          return new_nums.unshift(sym + c);
        };
        for (index = _j = 0, _len1 = nums.length; _j < _len1; index = ++_j) {
          _char = nums[index];
          process(_char, index);
        }
        return new_nums.join('');
      };
      this.extend = function() {
        var a, arg, args, clone, copied_src, deep, i, key, len, o, object, src, target, value, _j, _len1;
        target = arguments[0] || {};
        i = 1;
        deep = false;
        len = arguments.length;
        if (_this.type_of(target) === 'boolean') {
          deep = target;
          target = arguments[1] || {};
          i++;
        }
        if (!_this.is_object(target) && !_this.is_function(target)) {
          target = {};
        }
        args = Array.prototype.slice.call(arguments, i);
        for (_j = 0, _len1 = args.length; _j < _len1; _j++) {
          arg = args[_j];
          object = arg;
          for (key in object) {
            value = object[key];
            if (target === value) {
              continue;
            }
            o = String(key);
            clone = value;
            src = target[key];
            if (deep && (clone != null) && (_this.is_raw_object(clone) || (a = _this.is_array(clone)))) {
              if (a) {
                a = false;
                copied_src = src && (_this.is_array(src) ? src : []);
              } else {
                copied_src = src && (_this.is_raw_object(src) ? src : {});
              }
              target[key] = _this.extend(deep, copied_src, clone);
            } else if (clone != null) {
              target[key] = clone;
            }
          }
        }
        return target;
      };
      this["extends"] = function(child, parent) {
        var has, key;
        has = {}.hasOwnProperty;
        for (key in parent) {
          if (has.call(parent, key)) {
            child[key] = parent[key];
          }
        }
        return child;
      };
      this.to_hex = function(color) {
        var b, c, g, r;
        if (color.match(/^\#?[0-9a-fA-F]{6}|[0-9a-fA-F]{3}$/i)) {
          if (color.charAt(0 === '#')) {
            return color;
          } else {
            return '#' + color;
          }
        } else if (color.match(/^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/i)) {
          c = [parseInt(RegExp.$1, 10), parseInt(RegExp.$2, 10), parseInt(RegExp.$3, 10)];
          if (c.length === 3) {
            r = _this.zero_fill(c[0].toString(16, 2));
            g = _this.zero_fill(c[1].toString(16, 2));
            b = _this.zero_fill(c[2].toString(16, 2));
            return '#' + r + g + b;
          }
        } else {
          return false;
        }
      };
      this.to_rgb = function(color) {
        var b, c, g, r;
        if (color.match(/^rgb\s*\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*\)\s*$/)) {
          return color;
        } else if (color.match(/^\#?([0-9a-fA-F]{1,2})([0-9a-fA-F]{1,2})([0-9a-fA-F]{1,2})$/i)) {
          c = [parseInt(RegExp.$1, 16), parseInt(RegExp.$2, 16), parseInt(RegExp.$3, 16)];
          r = c[0].toString(10);
          g = c[1].toString(10);
          b = c[2].toString(10);
          return 'rgb(' + r + ',' + g + ',' + b + ')';
        } else {
          return false;
        }
      };
      this.strip_script = function(link) {
        var script;
        if (link.match(/^javascript:(\w\W.)/ || link.match(/(\w\W.)\((.*)\)/))) {
          script = RegExp.$1;
          console.log('Script stripped from link: ', script);
          return 'javascript:void(0)';
        } else {
          return link;
        }
      };
      this.type_of = function(obj) {
        return {}.toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
      };
      this.wrap = function() {
        var args, fn, i, pass_event;
        i = 1;
        fn = arguments[0];
        pass_event = false;
        if (_this["typeof"](fn) === 'boolean') {
          pass_event = fn;
          fn = arguments[1];
          i += 1;
        }
        args = Array.prototype.slice.call(arguments, i);
        if (!pass_event) {
          return function() {
            return fn.apply(this, args);
          };
        } else {
          return function(e) {
            args.unshift(e);
            return fn.apply(this, args);
          };
        }
      };
      this.zero_fill = function(num, length) {
        if (length == null) {
          length = 8;
        }
        return (Array(length).join('0') + num).slice(-length);
      };
      this.uuid = function() {
        var prefix;
        if (arguments[0]) {
          prefix = String(arguments[0]);
          return btoa(prefix + '-' + (+(new Date)).toString(16));
        } else {
          return btoa((+(new Date)).toString(16));
        }
      };
      this.resolve_uuid = function(uuid, data) {
        var key, parts, prefix, timestamp;
        key = atob(uuid);
        parts = key.split('-');
        if (parts.length > 1) {
          prefix = parts[0];
          timestamp = parseInt(parts[1], 16);
        } else {
          prefix = '';
          timestamp = parseInt(key, 16);
        }
        if (data === 'prefix') {
          return prefix;
        }
        if (data === 'timestamp') {
          return timestamp;
        }
        if (data === 'date') {
          return Date(timestamp);
        } else {
          return {
            prefix: prefix,
            timestamp: timestamp
          };
        }
      };
      this.resolve_date = function(uuid) {
        return _this.resolve_uuid(uuid, 'date');
      };
      this.resolve_prefix = function(uuid) {
        return _this.resolve_uuid(uuid, 'prefix');
      };
      this.resolve_timestamp = function(uuid) {
        return _this.resolve_uuid(uuid, 'timestamp');
      };
      this.init = function() {
        var bindings, f;
        bindings = {
          find: function(query) {
            return _.get(query, this);
          },
          getOffset: function() {
            return _.get_offset(this);
          },
          hasClass: function(cls) {
            return _.has_class(this, cls);
          },
          addClass: function(cls) {
            return _.add_class(this, cls);
          },
          removeClass: function(cls) {
            return _.remove_class(this, cls);
          },
          isChild: function(parent) {
            return _.is_child(parent, this);
          },
          isParent: function(child) {
            return _.is_child(this, child);
          },
          children: function() {
            return _.children(this);
          },
          resolveAncestor: function(node, bound) {
            return _.resolve_common_ancestor(this, node, bound);
          },
          bind: function(ev, fn, pr) {
            return _.bind(this, ev, fn, pr);
          },
          unbind: function(ev, fn, pr) {
            return _.unbind(this, ev, fn, pr);
          },
          append: function(node) {
            return _.append(this, node);
          },
          remove: function() {
            return _.remove(this);
          },
          val: function(data) {
            return _.val(this, data);
          },
          html: function() {
            return _.html(this);
          },
          fadeIn: function() {
            return HTMLElement.prototype.fadeInJacked.apply(this, arguments);
          },
          fadeOut: function() {
            return HTMLElement.prototype.fadeOutJacked.apply(this, arguments);
          },
          attr: function(key, data) {
            return _.attr.call(_, this, key, data);
          },
          data: function(key, data) {
            return _.data.call(_, this, key, data);
          }
        };
        _this.extend(Element.prototype, bindings);
        if (HTMLElement.prototype != null) {
          _this.extend(HTMLElement.prototype, bindings);
        }
        String.prototype.isJSON = function() {
          return _.is_JSON(this);
        };
        document.ready = function() {
          return _.ready.apply(_, arguments);
        };
        _this._state.init = true;
        delete _this._init;
        delete _this.constructor;
        f = function() {
          if (arguments.length > 0) {
            return f.get.apply(f, arguments);
          }
        };
        _this.extend(f, _this);
        return f;
      };
    }

    return Util;

  })();

  window.Util = Util;

  window._ = new Util().init();

  if (window.jQuery != null) {
    $.extend({
      _: window._
    });
  } else {
    window.$ = window._;
  }

  CoreDevAPI = (function(_super) {

    __extends(CoreDevAPI, _super);

    CoreDevAPI.prototype.debug = {
      strict: false,
      logging: true,
      eventlog: false,
      verbose: true,
      serverside: false
    };

    CoreDevAPI.mount = 'dev';

    CoreDevAPI.events = [];

    function CoreDevAPI(apptools, window) {
      var _sendError, _sendLog, _sendWarning,
        _this = this;
      _sendLog = function() {
        var args;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        return console.log.apply(console, args);
      };
      _sendError = function() {
        var args;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        return console.error.apply(console, args);
      };
      _sendWarning = function() {
        var args;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        return console.warn.apply(console, args);
      };
      this.eventlog = function() {
        var context, message, operation, _ref;
        operation = arguments[0], message = arguments[1], context = 3 <= arguments.length ? __slice.call(arguments, 2) : [];
        if (CoreDevAPI.prototype.debug.eventlog) {
          if ((_ref = operation.toLowerCase()) === 'bridge' || _ref === 'register' || _ref === 'hook') {
            if (CoreDevAPI.prototype.debug.verbose !== true) {
              return;
            }
          }
          _this.log.apply(_this, [['Events', operation].join(':'), message].concat(__slice.call(context)));
        }
      };
      this.log = function() {
        var context, message, module;
        module = arguments[0], message = arguments[1], context = 3 <= arguments.length ? __slice.call(arguments, 2) : [];
        if (!(context != null)) {
          context = '{no context}';
        }
        if (CoreDevAPI.prototype.debug.logging === true) {
          _sendLog.apply(null, ["[" + module + "] INFO: " + message].concat(__slice.call(context)));
        }
      };
      this.warning = this.warn = function() {
        var context, message, module;
        module = arguments[0], message = arguments[1], context = 3 <= arguments.length ? __slice.call(arguments, 2) : [];
        if (!(context != null)) {
          context = '{no context}';
        }
        if (CoreDevAPI.prototype.debug.logging === true) {
          _sendWarning.apply(null, ["[" + module + "] WARNING: " + message].concat(__slice.call(context)));
        }
      };
      this.error = function() {
        var context, message, module;
        module = arguments[0], message = arguments[1], context = 3 <= arguments.length ? __slice.call(arguments, 2) : [];
        if (CoreDevAPI.prototype.debug.logging === true) {
          _sendError.apply(null, ["[" + module + "] ERROR: " + message].concat(__slice.call(context)));
        }
      };
      this.verbose = function() {
        var context, message, module;
        module = arguments[0], message = arguments[1], context = 3 <= arguments.length ? __slice.call(arguments, 2) : [];
        if (CoreDevAPI.prototype.debug.verbose === true) {
          _sendLog.apply(null, ["[" + module + "] DEBUG: " + message].concat(__slice.call(context)));
        }
      };
      this.exception = this.critical = function() {
        var context, exception, message, module;
        module = arguments[0], message = arguments[1], exception = arguments[2], context = 4 <= arguments.length ? __slice.call(arguments, 3) : [];
        if (exception == null) {
          exception = window.AppToolsException;
        }
        _sendLog("A critical error or unhandled exception occurred.");
        _sendLog.apply(null, ["[" + module + "] CRITICAL: " + message].concat(__slice.call(context)));
        throw new exception(module, message, context);
      };
      if (apptools.sys.state.config.devtools.debug === true) {
        CoreDevAPI.prototype.debug.logging = true;
        CoreDevAPI.prototype.debug.verbose = true;
        if (apptools.sys.state.config.devtools.strict != null) {
          CoreDevAPI.prototype.debug.strict = apptools.sys.state.config.devtools.strict;
        }
      }
    }

    return CoreDevAPI;

  })(CoreAPI);

  this.__apptools_preinit.abstract_base_classes.push(CoreDevAPI);

  ModelException = (function(_super) {

    __extends(ModelException, _super);

    function ModelException(source, message) {
      this.source = source;
      this.message = message;
    }

    ModelException.prototype.toString = function() {
      return '[' + this.source + '] ModelException: ' + this.message;
    };

    return ModelException;

  })(Error);

  CoreModelAPI = (function(_super) {

    __extends(CoreModelAPI, _super);

    CoreModelAPI.mount = 'model';

    CoreModelAPI.events = [];

    function CoreModelAPI() {
      var _this = this;
      this._state = {
        init: false
      };
      this.put = function(object) {
        return _.block(_this.put_async, object);
      };
      this.get = function(key, kind) {
        return _.block(_this.get_async, key, kind);
      };
      this["delete"] = function(key, kind) {
        return _.block(_this.delete_async, key, kind);
      };
      this.put_async = function(callback) {
        if (callback == null) {
          callback = function(x) {
            return x;
          };
        }
        return apptools.storage.put(_this.constructor.prototype.name, callback);
      };
      this.get_async = function(key, callback) {
        if (callback == null) {
          callback = function(x) {
            return x;
          };
        }
        return apptools.storage.get(_this.key, _this.constructor.prototype.name, callback);
      };
      this.delete_async = function(callback) {
        if (callback == null) {
          callback = function(x) {
            return x;
          };
        }
        return apptools.storage["delete"](_this.key, _this.constructor.prototype.name, callback);
      };
      this.all = function(callback) {
        if (!(callback != null) || !(Util != null ? Util.is_function(callback) : void 0)) {
          if (callback != null) {
            throw 'Provided callback isn\'t a function. Whoops.';
          } else {
            throw 'all() requires a callback.';
          }
        } else {
          throw 'all() currently in active development, sorry.';
        }
      };
      this.register = function() {
        return apptools.dev.verbose('CoreModelAPI', 'register() currently in active development, sorry.');
      };
      this._init = function() {
        this._state.init = true;
        return this;
      };
    }

    return CoreModelAPI;

  })(CoreAPI);

  Model = (function() {

    Model.prototype.validate = function(message, cls, strict) {
      var check, key, results, value,
        _this = this;
      if (cls == null) {
        cls = this.constructor.prototype.model;
      }
      if (strict == null) {
        strict = true;
      }
      if (strict) {
        results = [];
        check = function(k, v) {
          var it, t, _it, _j, _len1, _results, _v;
          if (((_v = cls[k]) != null) && ((v != null) === (_v != null))) {
            if (typeof _v === 'function') {
              t = new _v();
              if (!t.validate(v)) {
                return results.push({
                  k: v
                });
              }
            } else if (_v.constructor.name === 'ListField') {
              _it = new _v[0]();
              _results = [];
              for (_j = 0, _len1 = v.length; _j < _len1; _j++) {
                it = v[_j];
                if (_it.validate(it)) {
                  continue;
                }
                results.push({
                  k: v
                });
                break;
              }
              return _results;
            } else if (v.constructor.name !== _v.constructor.name) {
              return results.push({
                k: v
              });
            }
          } else {
            return results.push({
              k: v
            });
          }
        };
      } else {
        results = {};
        check = function(k, v) {
          var it, temp, _j, _len1, _v;
          if (((_v = cls[k]) != null) && ((v != null) === (_v != null))) {
            if (typeof _v === 'function') {
              return results[k] = new _v().from_message(v);
            } else if (_v.constructor.name === 'ListField') {
              temp = new ListField();
              for (_j = 0, _len1 = v.length; _j < _len1; _j++) {
                it = v[_j];
                temp.push(new _v[0]().from_message(it));
              }
              return results[k] = temp;
            } else if (v.constructor.name === _v.constructor.name) {
              return results[k] = v;
            }
          }
        };
      }
      for (key in message) {
        if (!__hasProp.call(message, key)) continue;
        value = message[key];
        check(key, value);
      }
      if (!strict) {
        return results;
      }
      return results.length === 0;
    };

    Model.prototype.from_message = function(message, strict) {
      var modsafe, object, prop, val, valid;
      if (message == null) {
        message = {};
      }
      if (strict == null) {
        strict = false;
      }
      object = this;
      valid = object.validate(message);
      modsafe = object.validate(message, null, false);
      if (strict && !valid) {
        console.log('Strict from_message() failed. Returning unmodified object.', object);
      } else if (_.is_empty_object(modsafe)) {
        console.log('No modelsafe properties found. Returning unmodified object.', object);
      } else {
        for (prop in modsafe) {
          val = modsafe[prop];
          object[prop] = val;
        }
      }
      return object;
    };

    Model.prototype.to_message = function(excludes) {
      var item, message, object, prop, val, _j, _len1, _val;
      if (excludes == null) {
        excludes = [];
      }
      object = this;
      message = {};
      for (prop in object) {
        if (!__hasProp.call(object, prop)) continue;
        val = object[prop];
        if (typeof val !== 'function' && (object.constructor.prototype.model[prop] != null)) {
          if (val.constructor.name === 'ListField') {
            _val = [];
            for (_j = 0, _len1 = val.length; _j < _len1; _j++) {
              item = val[_j];
              _val.push(item.to_message());
            }
            message[prop] = _val;
          } else {
            message[prop] = val;
          }
        }
      }
      return message;
    };

    function Model(key) {
      var m, mounted, prop, temp, v, val, _fn, _j, _len1, _ref, _ref1,
        _this = this;
      if (_.is_raw_object(key) && arguments.length === 1) {
        for (prop in key) {
          val = key[prop];
          this[prop] = val;
        }
      } else {
        this.key = key;
      }
      _ref = Model.prototype;
      _fn = function(m) {
        return _this.prototype[m] = function() {
          return Model.prototype[m].apply(_this, arguments);
        };
      };
      for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
        m = _ref[_j];
        _fn(m);
      }
      if (this.constructor.mount != null) {
        mounted = this[this.constructor.mount];
        if (mounted != null) {
          _ref1 = mounted.constructor.prototype.model;
          for (prop in _ref1) {
            v = _ref1[prop];
            if (v.constructor.name !== 'ListField') {
              (function(mounted, prop) {
                _this.__defineGetter__(prop, function() {
                  return mounted[prop];
                });
                return _this.__defineSetter__(prop, function() {});
              })(mounted, prop);
            }
          }
        }
      }
      if ((temp = this.constructor.prototype.template || this.constructor.template) != null) {
        this.template = new window.t(temp);
      }
      return this;
    }

    return Model;

  })();

  Key = (function(_super) {

    __extends(Key, _super);

    function Key() {
      return Key.__super__.constructor.apply(this, arguments);
    }

    Key.prototype.model = {
      key: String()
    };

    return Key;

  })(Model);

  ListField = (function(_super) {

    __extends(ListField, _super);

    function ListField() {
      var _t,
        _this = this;
      ListField.__super__.constructor.call(this);
      if (arguments.length > 0) {
        _t = new ListField();
        _t.push(arguments[0]);
        return _t;
      }
      this.pick = function(item_or_index, new_index) {
        var back, diff, existing, front, index, item, len, new_back, new_front, newthis, _d;
        if (parseInt(item_or_index).toString() !== 'NaN') {
          index = item_or_index;
          len = this.length;
          if (new_index != null) {
            diff = index - new_index;
            if (diff > 0) {
              new_front = this.slice(0, new_index);
              newthis = new_front.join(this.slice(new_index).pick(diff));
            } else {
              _d = -diff;
              new_front = this.slice(0, index);
              new_back = this.slice(index);
              while (diff < 0) {
                new_back.pick(_d);
                diff++;
              }
              newthis = new_front.join(new_back);
            }
          } else {
            front = this.slice(0, index);
            back = this.slice(index + 1);
            newthis = this.slice(0, 0).push(this[index]).join(front).join(back);
          }
        } else {
          item = item_or_index;
          if (!!~(existing = _.indexOf(this, item))) {
            return this.pick(existing);
          }
          newthis = _.to_array(this);
          newthis.unshift(item);
        }
        this.empty();
        return this.join(newthis);
      };
      this.join = function(separator) {
        var i, item, len, string, _j, _k, _len1, _len2;
        if ((separator != null) && (_.is_array(separator) || (separator.constructor.name = this.constructor.name))) {
          for (_j = 0, _len1 = separator.length; _j < _len1; _j++) {
            item = separator[_j];
            this.push(item);
          }
          return this;
        } else {
          string = '';
          len = this.length;
          for (i = _k = 0, _len2 = this.length; _k < _len2; i = ++_k) {
            item = this[i];
            if (i === len - 1) {
              string += item.toString();
            }
            string += item.toString() + separator;
          }
          return string;
        }
      };
      this.slice = function(start, end) {
        var newlist, temp;
        if (start == null) {
          start = 0;
        }
        if (end == null) {
          end = this.length;
        }
        temp = [];
        while (start < end) {
          temp.push(this[start]);
          start++;
        }
        newlist = new this.constructor();
        return newlist.join(temp);
      };
      this.push = function(item) {
        var len;
        len = this.length;
        this[len] = item;
        this.length++;
        return this;
      };
      this.empty = function() {
        this.length = 0;
        return this;
      };
      this.keys = function() {
        var item, ks, _j, _len1;
        ks = [];
        for (_j = 0, _len1 = this.length; _j < _len1; _j++) {
          item = this[_j];
          if ((item != null) && (item.key != null)) {
            ks.push(item.key);
          }
        }
        return _.purge(ks);
      };
      this.order = function(new_index, prop) {
        var oldthis;
        if (prop == null) {
          prop = false;
        }
        oldthis = new ListField().join(this);
        this.empty();
        this.length = new_index.length;
        _.map(oldthis, function(item, i, arr) {
          return this[_.indexOf(new_index)] = (!!prop ? item[prop] : item);
        }, this);
        return this;
      };
      this.promote = function(key_or_index) {
        var index, key;
        if (parseInt(key_or_index).toString() !== 'NaN') {
          index = key_or_index;
        } else {
          key = key_or_index;
          index = _.indexOf(_this.keys(), key);
        }
        return _this.pick(index, index - 1);
      };
      this.demote = function(key_or_index) {
        var index, key;
        if (parseInt(key_or_index).toString() !== 'NaN') {
          index = key_or_index;
        } else {
          key = key_or_index;
          index = _.indexOf(_this.keys(), key);
        }
        return _this.pick(index, index + 1);
      };
      this.remove = function(key_or_index) {
        var copy, index, key, newthis;
        if (parseInt(key_or_index).toString() !== 'NaN') {
          index = key_or_index;
        } else {
          key = key_or_index;
          index = _.indexOf(_this.keys(), key);
        }
        copy = _this.slice();
        newthis = copy.slice(0, index).join(copy.slice(index + 1));
        _this.empty();
        return _this.join(newthis);
      };
      return this;
    }

    return ListField;

  })(Array);

  this.__apptools_preinit.abstract_base_classes.push(CoreModelAPI, Model, Key, ListField);

  CoreEventsAPI = (function(_super) {

    __extends(CoreEventsAPI, _super);

    CoreEventsAPI.mount = 'events';

    CoreEventsAPI.events = [];

    function CoreEventsAPI(apptools, window) {
      var _this = this;
      this.registry = [];
      this.callchain = {};
      this.history = [];
      this.mutators = [];
      this.fire = this.trigger = this.dispatch = function() {
        var args, bridge, event, event_bridges, hook, hook_error_count, hook_exec_count, nl, result, touched_events, _j, _k, _len1, _len2, _ref;
        event = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
        apptools.dev.eventlog('Trigger', 'Triggered event.', event, args, _this.callchain[event]);
        if (__indexOf.call(_this.registry, event) >= 0) {
          hook_exec_count = 0;
          hook_error_count = 0;
          event_bridges = [];
          touched_events = [];
          touched_events.push(event);
          _ref = _this.callchain[event].hooks;
          for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
            hook = _ref[_j];
            try {
              if (hook.once === true && hook.has_run === true) {
                continue;
              } else if (hook.bridge === false) {
                result = hook.fn.apply(hook, args);
                hook_exec_count++;
                _this.history.push({
                  event: event,
                  callback: hook,
                  args: args,
                  result: result
                });
                hook.has_run = true;
              } else if (hook.bridge === true) {
                event_bridges.push({
                  event: hook.event,
                  args: args,
                  mutator: hook.mutator
                });
              }
            } catch (error) {
              hook_error_count++;
              nl = _this.history.push({
                event: event,
                callback: hook,
                args: args,
                error: error
              });
              $.apptools.dev.eventlog('exception', 'Encountered unhandled exception when dispatching event hook for "' + event + '".', _this.history[nl - 1]);
              if ($.apptools.dev.debug.eventlog && $.apptools.dev.debug.verbose) {
                $.apptools.dev.error('Events', 'Unhandled event hook exception.', error);
              }
              if ($.apptools.dev.debug.strict) {
                throw error;
              }
            }
          }
          for (_k = 0, _len2 = event_bridges.length; _k < _len2; _k++) {
            bridge = event_bridges[_k];
            touched_events.push(bridge.event);
            if (bridge.mutator !== false) {
              _this.trigger.apply(_this, [bridge.event].concat(__slice.call(_this.mutators[bridge.mutator](bridge.args, event, bridge.event))));
            } else {
              _this.trigger.apply(_this, [bridge.event].concat(__slice.call(bridge.args)));
            }
          }
          return {
            events: touched_events,
            executed: hook_exec_count,
            errors: hook_error_count
          };
        } else {
          return false;
        }
      };
      this.create = this.register = function(names) {
        var name, _j, _len1;
        if (!_.is_array(names)) {
          if (_.is_string(names) && names === '') {
            return;
          }
          names = [names];
        } else {
          if (names.length === 0) {
            return;
          }
        }
        apptools.dev.eventlog('Register', 'Registered events.', {
          count: names.length,
          events: names
        });
        for (_j = 0, _len1 = names.length; _j < _len1; _j++) {
          name = names[_j];
          _this.registry.push(name);
          _this.callchain[name] = {
            hooks: []
          };
        }
        return _this;
      };
      this.on = this.upon = this.when = this.hook = function(event, callback, once) {
        if (once == null) {
          once = false;
        }
        if (__indexOf.call(_this.registry, event) < 0) {
          apptools.dev.warning('warn', 'Tried to hook to unrecognized event. Registering...');
          _this.register(event);
        }
        _this.callchain[event].hooks.push({
          fn: callback,
          once: once,
          has_run: false,
          bridge: false
        });
        apptools.dev.eventlog('Hook', 'Hook registered on event.', event);
        return true;
      };
      this.delegate = this.bridge = function(from_events, to_events, context_mutator_fn) {
        var nl, source_ev, target_ev, _j, _len1, _results;
        if (context_mutator_fn == null) {
          context_mutator_fn = null;
        }
        if (typeof to_events === 'string') {
          to_events = [to_events];
        }
        if (typeof from_events === 'string') {
          from_events = [from_events];
        }
        apptools.dev.eventlog('Bridge', 'Bridging events.', {
          from: from_events
        }, '->', {
          to: to_events
        });
        _results = [];
        for (_j = 0, _len1 = from_events.length; _j < _len1; _j++) {
          source_ev = from_events[_j];
          _results.push((function() {
            var _k, _len2, _results1;
            _results1 = [];
            for (_k = 0, _len2 = to_events.length; _k < _len2; _k++) {
              target_ev = to_events[_k];
              if (!(this.callchain[source_ev] != null)) {
                apptools.dev.warn('Events', 'Bridging from undefined source event:', source_ev);
                this.register(source_ev);
              }
              if (context_mutator_fn != null) {
                nl = this.mutators.push(context_mutator_fn);
                _results1.push(this.callchain[source_ev].hooks.push({
                  event: target_ev,
                  bridge: true,
                  mutator: nl - 1
                }));
              } else {
                _results1.push(this.callchain[source_ev].hooks.push({
                  event: target_ev,
                  bridge: true,
                  mutator: false
                }));
              }
            }
            return _results1;
          }).call(_this));
        }
        return _results;
      };
    }

    return CoreEventsAPI;

  })(CoreAPI);

  this.__apptools_preinit.abstract_base_classes.push(CoreEventsAPI);

  CoreAgentAPI = (function(_super) {

    __extends(CoreAgentAPI, _super);

    CoreAgentAPI.mount = 'agent';

    CoreAgentAPI.events = ['UA_DISCOVER'];

    function CoreAgentAPI(apptools, window) {
      var detection_data, discover, _makeMatch, _makeVersion,
        _this = this;
      this.platform = {};
      this.fingerprint = {};
      this.capabilities = {};
      if (apptools.lib.modernizr != null) {
        this.capabilities = apptools.lib.modernizr;
      }
      this.capabilities.simple = {};
      detection_data = {
        browsers: [
          {
            string: navigator.userAgent,
            subString: "Chrome",
            identity: "Chrome"
          }, {
            string: navigator.userAgent,
            subString: "OmniWeb",
            versionSearch: "OmniWeb/",
            identity: "OmniWeb"
          }, {
            string: navigator.vendor,
            subString: "Apple",
            identity: "Safari",
            versionSearch: "Version"
          }, {
            prop: window.opera,
            identity: "Opera"
          }, {
            string: navigator.vendor,
            subString: "iCab",
            identity: "iCab"
          }, {
            string: navigator.vendor,
            subString: "KDE",
            identity: "Konqueror"
          }, {
            string: navigator.userAgent,
            subString: "Firefox",
            identity: "Firefox"
          }, {
            string: navigator.vendor,
            subString: "Camino",
            identity: "Camino"
          }, {
            string: navigator.userAgent,
            subString: "Netscape",
            identity: "Netscape"
          }, {
            string: navigator.userAgent,
            subString: "MSIE",
            identity: "Explorer",
            versionSearch: "MSIE"
          }, {
            string: navigator.userAgent,
            subString: "Gecko",
            identity: "Mozilla",
            versionSearch: "rv"
          }, {
            string: navigator.userAgent,
            subString: "Mozilla",
            identity: "Netscape",
            versionSearch: "Mozilla"
          }
        ],
        os: [
          {
            string: navigator.platform,
            subString: "Win",
            identity: "Windows"
          }, {
            string: navigator.platform,
            subString: "Mac",
            identity: "Mac"
          }, {
            string: navigator.userAgent,
            subString: "iPhone",
            identity: "iPhone/iPod"
          }, {
            string: navigator.platform,
            subString: "Linux",
            identity: "Linux"
          }
        ]
      };
      _makeMatch = function(sample) {
        var value, _j, _len1;
        for (_j = 0, _len1 = sample.length; _j < _len1; _j++) {
          value = sample[_j];
          if (value.string != null) {
            if (value.string.indexOf(value.subString) !== -1) {
              detection_data.versionSearchString = value.versionSearch || value.identity;
              return value.identity;
            }
          } else if (value.prop) {
            detection_data.versionSearchString = value.versionSearch || value.identity;
            return value.identity;
          }
        }
      };
      _makeVersion = function(dataString) {
        var index;
        index = dataString.indexOf(detection_data.versionSearchString);
        if (index === -1) {

        } else {
          return parseFloat(dataString.substring(index + detection_data.versionSearchString.length + 1));
        }
      };
      discover = function() {
        var browser, mobile, os, type, version;
        browser = _makeMatch(detection_data.browsers) || "unknown";
        version = _makeVersion(navigator.userAgent) || _makeVersion(navigator.appVersion) || "unknown";
        os = _makeMatch(detection_data.os) || "unknown";
        if ((browser.search('iPod/iPhone') !== -1) || (browser.search('Android') !== -1)) {
          type = 'mobile';
          mobile = true;
        } else {
          type = 'desktop';
          mobile = false;
        }
        _this.platform = {
          os: os,
          type: type,
          vendor: navigator.vendor,
          product: navigator.product,
          browser: browser,
          version: version,
          flags: {
            online: navigator.onLine || true,
            mobile: mobile,
            webkit: /AppleWebKit\//.test(navigator.userAgent),
            msie: /MSIE/.test(navigator.userAgent),
            opera: /Opera/.test(navigator.userAgent),
            mozilla: /Firefox/.test(navigator.userAgent)
          }
        };
        _this.capabilities.simple.cookies = navigator.cookieEnabled;
        if (window.XMLHttpRequest != null) {
          _this.capabilities.simple.ajax = true;
        }
        return {
          browser: [_this.platform.browser, _this.platform.version].join(":"),
          mobile: _this.platform.flags.mobile,
          legacy: _this.platform.flags.msie
        };
      };
      this.fingerprint = discover();
      return this;
    }

    return CoreAgentAPI;

  })(CoreAPI);

  this.__apptools_preinit.abstract_base_classes.push(CoreAgentAPI);

  this.StorageDriver = StorageDriver = (function(_super) {

    __extends(StorageDriver, _super);

    StorageDriver.methods = ['compatible', 'construct'];

    StorageDriver["export"] = "public";

    function StorageDriver() {}

    return StorageDriver;

  })(CoreInterface);

  this.compatible = function() {};

  this.construct = function() {};

  this.StorageAdapter = StorageAdapter = (function(_super) {

    __extends(StorageAdapter, _super);

    StorageAdapter.methods = ['get', 'put', 'delete', 'clear', 'get_async', 'put_async', 'delete_async', 'clear_async'];

    StorageAdapter["export"] = "public";

    function StorageAdapter() {
      return;
    }

    return StorageAdapter;

  })(CoreInterface);

  this.KeyEncoder = KeyEncoder = (function(_super) {

    __extends(KeyEncoder, _super);

    KeyEncoder.methods = ['build_key', 'encode_key', 'build_cluster', 'encode_cluster'];

    KeyEncoder["export"] = "public";

    function KeyEncoder() {
      return;
    }

    return KeyEncoder;

  })(CoreInterface);

  if (this.__apptools_preinit != null) {
    if (!(this.__apptools_preinit.abstract_base_classes != null)) {
      this.__apptools_preinit.abstract_base_classes = [];
    }
    if (!(this.__apptools_preinit.deferred_core_modules != null)) {
      this.__apptools_preinit.deferred_core_modules = [];
    }
  } else {
    this.__apptools_preinit = {
      abstract_base_classes: [],
      deferred_core_modules: []
    };
  }

  this.__apptools_preinit.detected_storage_engines = [];

  this.__apptools_preinit.abstract_base_classes.push(StorageDriver, StorageAdapter);

  this.__apptools_preinit.abstract_feature_interfaces.push({
    adapter: StorageDriver,
    name: "storage"
  });

  this.SimpleKeyEncoder = SimpleKeyEncoder = (function(_super) {

    __extends(SimpleKeyEncoder, _super);

    function SimpleKeyEncoder() {
      var _this = this;
      this.build_key = function() {};
      this.encode_key = function() {};
      this.build_cluster = function() {};
      this.encode_cluster = function() {};
    }

    return SimpleKeyEncoder;

  })(KeyEncoder);

  _simple_key_encoder = new SimpleKeyEncoder();

  /* === DOM Storage Engines ===
  */


  this.LocalStorageEngine = LocalStorageEngine = (function(_super) {

    __extends(LocalStorageEngine, _super);

    function LocalStorageEngine(name) {
      var _this = this;
      this.name = name;
      this._state = {
        runtime: {
          count: {
            total_keys: 0,
            by_kind: []
          }
        }
      };
      this.get_async = function(key, callback) {
        var object;
        return callback.call(object = _this.get(key));
      };
      this.put_async = function(key, value, callback) {
        _this.put(key, value);
        return callback.call(value);
      };
      this.delete_async = function(key, callback) {
        _this["delete"](key);
        return callback.call(_this);
      };
      this.clear_async = function(callback) {
        _this.clear();
        return callback.call(_this);
      };
      this.get = function(key) {
        return localStorage.getItem(key);
      };
      this.put = function(key, value) {
        if (!(_this.get(key) != null)) {
          _this._state.runtime.count.total_keys++;
        }
        return localStorage.setItem(key, value);
      };
      this["delete"] = function(key) {
        _this._state.runtime.count.total_keys--;
        return localStorage.removeItem(key);
      };
      this.clear = function() {
        _this._state.runtime.count.total_keys = 0;
        return localStorage.clear();
      };
      return;
    }

    return LocalStorageEngine;

  })(StorageAdapter);

  this.SessionStorageEngine = SessionStorageEngine = (function(_super) {

    __extends(SessionStorageEngine, _super);

    function SessionStorageEngine(name) {
      var _this = this;
      this.name = name;
      this._state = {
        runtime: {
          count: {
            total_keys: 0,
            by_kind: []
          }
        }
      };
      this.get_async = function(key, callback) {
        var object;
        return callback.call(object = _this.get(key));
      };
      this.put_async = function(key, value, callback) {
        _this.put(key, value);
        return callback.call(value);
      };
      this.delete_async = function(key, callback) {
        _this["delete"](key);
        return callback.call(_this);
      };
      this.clear_async = function(callback) {
        _this.clear();
        return callback.call(_this);
      };
      this.get = function(key) {
        return sessionStorage.getItem(key);
      };
      this.put = function(key, value) {
        if (!(_this.get(key) != null)) {
          _this._state.runtime.count.total_keys++;
        }
        return sessionStorage.setItem(key, value);
      };
      this["delete"] = function(key) {
        _this._state.runtime.count.total_keys--;
        return sessionStorage.removeItem(key);
      };
      this.clear = function() {
        _this._state.runtime.count.total_keys = 0;
        return sessionStorage.clear();
      };
      return;
    }

    return SessionStorageEngine;

  })(StorageAdapter);

  /* === DOM Storage Drivers ===
  */


  this.LocalStorageDriver = LocalStorageDriver = (function(_super) {

    __extends(LocalStorageDriver, _super);

    function LocalStorageDriver() {
      var _this = this;
      this._state = {};
      this.compatible = function() {
        return !!window.localStorage;
      };
      this.construct = function(name) {
        var new_engine;
        if (name == null) {
          name = 'appstorage';
        }
        if (_this.compatible()) {
          return new_engine = new LocalStorageEngine(name);
        } else {
          return false;
        }
      };
      return;
    }

    return LocalStorageDriver;

  })(StorageDriver);

  this.SessionStorageDriver = SessionStorageDriver = (function(_super) {

    __extends(SessionStorageDriver, _super);

    function SessionStorageDriver() {
      var _this = this;
      this._state = {};
      this.compatible = function() {
        return !!window.sessionStorage;
      };
      this.construct = function(name) {
        var new_engine;
        if (name == null) {
          name = 'appstorage';
        }
        if (_this.compatible()) {
          return new_engine = new SessionStorageEngine(name);
        } else {
          return false;
        }
      };
      return;
    }

    return SessionStorageDriver;

  })(StorageDriver);

  this.__apptools_preinit.detected_storage_engines.push({
    name: "LocalStorage",
    adapter: LocalStorageEngine,
    driver: LocalStorageDriver,
    key_encoder: _simple_key_encoder
  });

  this.__apptools_preinit.detected_storage_engines.push({
    name: "SessionStorage",
    adapter: SessionStorageEngine,
    driver: SessionStorageDriver,
    key_encoder: _simple_key_encoder
  });

  this.__apptools_preinit.abstract_base_classes.push(SimpleKeyEncoder, LocalStorageEngine, SessionStorageEngine, LocalStorageEngine, SessionStorageDriver);

  this.CoreStorageAPI = CoreStorageAPI = (function(_super) {

    __extends(CoreStorageAPI, _super);

    CoreStorageAPI.mount = 'storage';

    CoreStorageAPI.events = ['STORAGE_INIT', 'ENGINE_LOADED', 'STORAGE_READY', 'STORAGE_ERROR', 'STORAGE_ACTIVITY', 'STORAGE_READ', 'STORAGE_WRITE', 'STORAGE_DELETE', 'COLLECTION_SCAN', 'COLLECTION_CREATE', 'COLLECTION_DESTROY', 'COLLECTION_UPDATE', 'COLLECTION_SYNC'];

    function CoreStorageAPI(apptools, window) {
      var _this = this;
      this._state = {
        runtime: {
          index: {
            key_read_tally: {},
            key_write_tally: {},
            local_by_key: {},
            local_by_kind: {}
          },
          count: {
            total_keys: 0,
            by_collection: [],
            by_kind: []
          },
          data: {}
        },
        config: {
          autoload: false,
          autosync: {
            enabled: false,
            interval: 120
          },
          drivers: [],
          engines: {},
          encrypt: false,
          integrity: false,
          obfuscate: false,
          local_only: false,
          callbacks: {
            ready: null,
            sync: null
          }
        },
        supervisor: {},
        cachebridge: {},
        model_kind_map: {},
        collection_kind_map: {}
      };
      this.internal = {
        check_support: function(modernizr) {},
        bootstrap: function(lawnchair) {},
        provision_collection: function(name, adapter, callback) {},
        add_storage_engine: function(name, driver, engine) {
          var d, e;
          try {
            d = new driver(apptools);
            e = new engine(apptools);
          } catch (err) {
            return false;
          }
          if (e.compatible()) {
            _this._state.config.engines[name] = e;
            driver.adapter = _this._state.config.engines[name];
            _this._state.config.drivers.push(driver);
            apptools.sys.drivers.install('storage', name, d, (d.enabled != null) | true, (d.priority != null) | 50, function(driver) {
              return apptools.events.trigger('ENGINE_LOADED', {
                driver: driver,
                engine: driver.adapter
              });
            });
            return true;
          } else {
            apptools.dev.verbose('StorageEngine', 'Detected incompatible storage engine. Skipping.', name, driver, engine);
            return false;
          }
        }
      };
      this.get = function() {};
      this.list = function() {};
      this.count = function() {};
      this.put = function() {};
      this.query = function() {};
      this["delete"] = function() {};
      this.sync = function() {};
      this._init = function() {
        var engine, _j, _len1, _ref, _ref1, _ref2;
        apptools.events.trigger('STORAGE_INIT');
        apptools.dev.verbose('Storage', 'Storage support is currently under construction.');
        if (((_ref = apptools.sys) != null ? (_ref1 = _ref.preinit) != null ? _ref1.detected_storage_engines : void 0 : void 0) != null) {
          _ref2 = apptools.sys.preinit.detected_storage_engines;
          for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
            engine = _ref2[_j];
            _this.internal.add_storage_engine(engine.name, engine.driver, engine.adapter);
          }
        }
        return apptools.events.trigger('STORAGE_READY');
      };
      apptools.events.bridge(['STORAGE_READ', 'STORAGE_WRITE', 'STORAGE_DELETE'], 'STORAGE_ACTIVITY');
      apptools.events.bridge(['COLLECTION_CREATE', 'COLLECTION_UPDATE', 'COLLECTION_DESTROY', 'COLLECTION_SYNC', 'COLLECTION_SCAN'], 'STORAGE_ACTIVITY');
    }

    return CoreStorageAPI;

  })(CoreAPI);

  this.__apptools_preinit.abstract_base_classes.push(CoreStorageAPI);

  this.__apptools_preinit.deferred_core_modules.push({
    module: CoreStorageAPI
  });

  this.TransportInterface = TransportInterface = (function(_super) {

    __extends(TransportInterface, _super);

    function TransportInterface() {
      return TransportInterface.__super__.constructor.apply(this, arguments);
    }

    TransportInterface.prototype.capability = 'transport';

    TransportInterface.prototype.required = [];

    return TransportInterface;

  })(Interface);

  this.RPCInterface = RPCInterface = (function(_super) {

    __extends(RPCInterface, _super);

    function RPCInterface() {
      return RPCInterface.__super__.constructor.apply(this, arguments);
    }

    RPCInterface.prototype.capability = 'rpc';

    RPCInterface.prototype.parent = TransportInterface;

    RPCInterface.prototype.required = ['factory', 'fulfill'];

    RPCInterface.prototype.factory = function() {};

    RPCInterface.prototype.fulfill = function() {};

    return RPCInterface;

  })(TransportInterface);

  this.NativeXHR = NativeXHR = (function(_super) {

    __extends(NativeXHR, _super);

    NativeXHR.prototype.xhr = null;

    NativeXHR.prototype.request = null;

    NativeXHR.prototype.headers = {};

    NativeXHR.prototype.events = {};

    function NativeXHR(xhr, request) {
      var _this = this;
      this.xhr = xhr;
      this.request = request;
      this.open = function(http_method, url, async) {
        return _this.xhr.open(http_method, url, async);
      };
      this.get_header = function(key) {
        return _this.headers[key];
      };
      this.set_header = function(key, value) {
        return _this.headers[key] = value;
      };
      this.send = function(payload) {
        var callback, key, name, value, _ref, _ref1;
        _ref = _this.headers;
        for (key in _ref) {
          value = _ref[key];
          _this.xhr.setRequestHeader(key, value);
        }
        _ref1 = _this.events;
        for (name in _ref1) {
          callback = _ref1[name];
          _this.xhr[name] = callback;
        }
        return _this.xhr.send(payload);
      };
      return this;
    }

    return NativeXHR;

  })(CoreObject);

  this.RPCPromise = RPCPromise = (function(_super) {

    __extends(RPCPromise, _super);

    RPCPromise.prototype.expected = null;

    RPCPromise.prototype.directive = null;

    RPCPromise.prototype.fulfilled = false;

    function RPCPromise(expected, directive) {
      this.expected = expected;
      this.directive = directive;
      return this;
    }

    RPCPromise.prototype.value = function(block, autostart) {
      if (block == null) {
        block = true;
      }
      if (autostart == null) {
        autostart = false;
      }
      if (directive.status !== 'constructed') {
        if (directive.status === 'pending') {
          while (true) {
            if (directive.status !== 'pending') {
              break;
            }
          }
          return directive.response;
        } else {
          return this.directive.response;
        }
      } else {
        return this.directive.request.fulfill();
      }
    };

    return RPCPromise;

  })(CoreObject);

  this.ServiceLayerDriver = ServiceLayerDriver = (function(_super) {

    __extends(ServiceLayerDriver, _super);

    ServiceLayerDriver.prototype.name = 'apptools';

    ServiceLayerDriver.prototype["native"] = true;

    ServiceLayerDriver.prototype["interface"] = [RPCInterface];

    function ServiceLayerDriver(apptools) {
      var _this = this;
      this.internal = {
        status_codes: {
          errors: [400, 401, 403, 404, 405, 406, 500, 501, 502, 503, 504, 505],
          success: [200, 201, 202, 203, 204, 205, 303, 304, 301, 302, 307, 308]
        },
        endpoint: function(request) {}
      };
      this.rpc = {
        factory: function(context) {
          return new NativeXHR(new XMLHttpRequest(), context);
        },
        fulfill: function(xhr, request, dispatch) {
          var decode, failure, header, load, value, _ref;
          xhr.open(request.context.http_method, request.endpoint(apptools.rpc.state.config.jsonrpc), request.context.async);
          _ref = _.extend({
            "Content-Type": request.context.content_type
          }, apptools.rpc.state.config.headers, request.context.headers);
          for (header in _ref) {
            value = _ref[header];
            xhr.set_header(header, value);
          }
          decode = function(status, event, request) {
            var response;
            try {
              if (!((!(event.target.response != null)) || (!_.is_string(event.target.response)) || (event.target.response.length < 0))) {
                response = {
                  response: {
                    type: 'GenericResponse',
                    content: JSON.parse(event.target.response)
                  },
                  platform: {
                    engine: 'canteen/python'
                  },
                  status: status,
                  id: request.envelope.id
                }
              }
            } catch (e) {
              response = event.target.response;
            }
            if (_.in_array(_this.internal.status_codes.errors, event.target.status)) {
              return dispatch('failure', response);
            }
            return dispatch(response.status, response);
          };
          load = xhr.events.onload = function(event) {
            return decode('success', event, request);
          };
          failure = xhr.events.onerror = xhr.events.onabort = xhr.events.timeout = function(event) {
            return decode('failure', event, request);
          };
          return xhr.send(JSON.stringify(request.payload()));
        }
      };
      return ServiceLayerDriver.__super__.constructor.call(this, apptools);
    }

    return ServiceLayerDriver;

  })(Driver);

  this.RPCContext = RPCContext = (function(_super) {

    __extends(RPCContext, _super);

    RPCContext.prototype.model = {
      url: String(),
      async: Boolean(),
      defer: Boolean(),
      headers: Object(),
      cacheable: Boolean(),
      http_method: String(),
      crossdomain: Boolean(),
      content_type: String(),
      ifmodified: Boolean(),
      base_uri: String()
    };

    RPCContext.prototype.defaults = {
      async: true,
      defer: false,
      headers: {},
      cacheable: false,
      http_method: 'POST',
      crossdomain: false,
      content_type: 'application/json',
      ifmodified: false
    };

    function RPCContext(opts) {
      if (opts == null) {
        opts = {};
      }
      _.extend(this, this.defaults, opts);
    }

    return RPCContext;

  })(Model);

  this.RPCEnvelope = RPCEnvelope = (function(_super) {

    __extends(RPCEnvelope, _super);

    function RPCEnvelope() {
      return RPCEnvelope.__super__.constructor.apply(this, arguments);
    }

    return RPCEnvelope;

  })(Model);

  this.RequestEnvelope = RequestEnvelope = (function(_super) {

    __extends(RequestEnvelope, _super);

    RequestEnvelope.prototype.model = {
      id: Number(),
      opts: Object(),
      agent: Object()
    };

    function RequestEnvelope(envelope) {
      _.extend(this, envelope);
    }

    return RequestEnvelope;

  })(RPCEnvelope);

  this.ResponseEnvelope = ResponseEnvelope = (function(_super) {

    __extends(ResponseEnvelope, _super);

    ResponseEnvelope.prototype.model = {
      id: Number(),
      flags: Object(),
      platform: Object()
    };

    function ResponseEnvelope(envelope) {
      ResponseEnvelope.__super__.constructor.call(this, _.extend(this, envelope));
    }

    return ResponseEnvelope;

  })(RPCEnvelope);

  this.RPC = RPC = (function(_super) {

    __extends(RPC, _super);

    RPC.prototype.model = {
      ttl: Number(),
      context: RPCContext,
      envelope: RPCEnvelope
    };

    function RPC() {
      this.state = __bind(this.state, this);
      return this.state('constructed');
    }

    RPC.prototype.expired = function() {
      return true;
    };

    RPC.prototype.state = function(state) {
      if (!(this.flags != null)) {
        this.flags = {};
      }
      this.flags.state = state;
      return this;
    };

    return RPC;

  })(Model);

  this.RPCRequest = RPCRequest = (function(_super) {

    __extends(RPCRequest, _super);

    RPCRequest.prototype.states = ['constructed', 'pending', 'fulfilled'];

    RPCRequest.prototype.model = {
      state: String(),
      params: Object(),
      method: String(),
      service: String()
    };

    function RPCRequest(object) {
      this.payload = __bind(this.payload, this);

      this.fingerprint = __bind(this.fingerprint, this);
      RPCRequest.__super__.constructor.call(this, _.extend(this, object));
    }

    RPCRequest.prototype.fulfill = function(callbacks) {
      if (callbacks == null) {
        callbacks = {};
      }
      return $.apptools.rpc.request.fulfill(this, callbacks);
    };

    RPCRequest.prototype.defer = function(push) {
      return this.flags.defer = push;
    };

    RPCRequest.prototype.fingerprint = function() {
      return window.btoa(JSON.stringify([this.service, this.method, this.params, this.envelope.opts]));
    };

    RPCRequest.prototype.endpoint = function(config) {
      var base_host, base_uri;
      if (config == null) {
        config = {};
      }
      if (!(this.context.url != null)) {
        if (!(config.host != null)) {
          base_host = [window.location.protocol, window.location.host].join('//');
        } else {
          base_host = config.host;
        }
        if ((this.context.base_uri != null) && _.is_string(this.context.base_uri)) {
          base_uri = this.context.base_uri;
        } else {
          base_uri = config.base_uri;
        }
        return [[base_host.concat(base_uri), this.service].join('/'), this.method].join('.');
      }
      return this.context.url;
    };

    RPCRequest.prototype.payload = function() {
      return this.params;
    };

    return RPCRequest;

  })(RPC);

  this.RPCResponse = RPCResponse = (function(_super) {

    __extends(RPCResponse, _super);

    RPCResponse.prototype.states = ['constructed', 'pending', 'success', 'failure', 'wait'];

    RPCResponse.prototype.model = {
      type: String(),
      status: String(),
      payload: Object()
    };

    RPCResponse.prototype.events = {
      success: null,
      failure: null
    };

    function RPCResponse(response) {
      this.inflate = __bind(this.inflate, this);
      RPCResponse.__super__.constructor.call(this, _.extend(this, response));
    }

    RPCResponse.prototype.inflate = function(raw_response) {
      return _.extend(this, raw_response);
    };

    RPCResponse.prototype.callbacks = function(events) {
      this.events = events;
      return this;
    };

    return RPCResponse;

  })(RPC);

  this.RPCErrorResponse = RPCErrorResponse = (function(_super) {

    __extends(RPCErrorResponse, _super);

    RPCErrorResponse.prototype.model = {
      code: Number(),
      message: String()
    };

    function RPCErrorResponse(response, raw_response) {
      var _ref;
      this.events = response.events;
      if (!(((_ref = raw_response.response) != null ? _ref.content : void 0) != null)) {
        $.apptools.dev.error('RPC', 'Invalid RPC error structure.', response, raw_response);
        throw "Invalid RPC error structure.";
      }
      return this.inflate(raw_response);
    }

    return RPCErrorResponse;

  })(RPCResponse);

  this.RPCAPI = RPCAPI = (function(_super) {

    __extends(RPCAPI, _super);

    function RPCAPI(name, methods, config, apptools) {
      var method, __remote_method_proxy, _j, _len1;
      __remote_method_proxy = function(name, method, config, apptools) {
        var _this = this;
        return function(params, context, opts, envelope, request_class) {
          if (params == null) {
            params = {};
          }
          if (context == null) {
            context = {};
          }
          if (opts == null) {
            opts = {};
          }
          if (envelope == null) {
            envelope = {};
          }
          if (request_class == null) {
            request_class = RPCRequest;
          }
          return (function(params, context, opts, envelope) {
            return apptools.rpc.request.factory({
              method: method,
              service: name,
              params: params || {},
              context: new RPCContext(_.extend(apptools.rpc.request.context["default"](), context)),
              envelope: new RequestEnvelope(_.extend(envelope, {
                id: apptools.rpc.request.provision(),
                opts: opts || {},
                agent: apptools.agent.fingerprint
              }))
            }, request_class);
          })(params, context, opts, envelope);
        };
      };
      if (!(!(methods.length != null) || methods.length === 0)) {
        for (_j = 0, _len1 = methods.length; _j < _len1; _j++) {
          method = methods[_j];
          this[method] = __remote_method_proxy(name, method, config, apptools);
        }
      }
      apptools.rpc.service.register(this, methods, config);
      return this;
    }

    return RPCAPI;

  })(CoreObject);

  this.CoreRPCAPI = CoreRPCAPI = (function(_super) {

    __extends(CoreRPCAPI, _super);

    CoreRPCAPI.mount = 'rpc';

    CoreRPCAPI.events = ['RPC_CREATE', 'RPC_FULFILL', 'RPC_SUCCESS', 'RPC_FAILURE', 'RPC_COMPLETE', 'RPC_PROGRESS'];

    function CoreRPCAPI(apptools, window) {
      var _this = this;
      this.state = {
        config: {
          jsonrpc: {
            host: null,
            enabled: true,
            base_uri: '/_rpc/v1',
            default_ttl: null,
            driver: null
          },
          channel: {
            token: null,
            script: null,
            enabled: false,
            status: 'DISCONNECTED',
            default_ttl: null,
            driver: null
          },
          sockets: {
            host: null,
            token: null,
            enabled: false,
            status: 'DISCONNECTED',
            default_ttl: null,
            driver: null
          },
          headers: {
            "X-ServiceClient": ["AppToolsJS/", AppTools.version.get()].join(''),
            "X-ServiceTransport": "AppTools/JSONRPC"
          }
        },
        consumer: null,
        requestpool: {
          id: 1,
          data: [],
          index: [],
          done: [],
          queue: [],
          error: [],
          expect: {},
          context: new RPCContext
        },
        servicepool: {
          name_i: {},
          rpc_apis: []
        },
        history: {
          last_request: null,
          last_error: null,
          last_success: null,
          rpclog: []
        },
        cache: {
          data: {},
          index: {}
        }
      };
      this.internals = {
        validate: function(rpc) {
          return rpc;
        },
        respond: function(directive, use_cache) {
          var x;
          if (use_cache == null) {
            use_cache = false;
          }
          apptools.events.trigger('RPC_FULFILL', directive);
          if (use_cache) {
            if ((directive.request.cacheable != null) && directive.request.cacheable === true) {
              try {
                if (((x = _this.state.cache.data[_this.state.cache.index[directive.request.fingerprint()]]) != null) && !x.expired()) {
                  return _this.internals.validate(x);
                }
              } catch (_error) {}
            }
          }
          return [_this.internals.expect(directive, use_cache), _this.internals.send_rpc(directive)];
        },
        expect: function(directive, use_cache) {
          directive.status = 'pending';
          directive.request.state('pending');
          directive.response.state('pending');
          return new RPCPromise(directive, (_this.state.requestpool.expect[_this.state.requestpool.index[directive.request.envelope.id]] = {
            success: function(response) {
              directive.status = 'success';
              directive.request.state('fulfilled');
              directive.response.state('success');
              _this.state.requestpool.done.push(_this.state.requestpool.index[directive.request.envelope.id]);
              _this.state.requestpool.queue.splice(directive.queue_i, directive.queue_i);
              delete _this.state.requestpool.expect[_this.state.requestpool.index[directive.request.envelope.id]];
              if (use_cache) {
                _this.response.store(directive.request, directive.response);
              }
              apptools.events.dispatch('RPC_SUCCESS', directive);
              directive.response.events.success(response.response.content, response.response.type, response);
            },
            failure: function(response) {
              directive.status = 'failure';
              directive.response.state('failure');
              directive.request.state('fulfilled');
              _this.state.requestpool.error.push(_this.state.requestpool.index[directive.request.envelope.id]);
              _this.state.requestpool.queue.splice(directive.queue_i, directive.queue_i);
              delete _this.state.requestpool.expect[_this.state.requestpool.index[directive.request.envelope.id]];
              apptools.events.dispatch('RPC_FAILURE', directive);
              directive.response.events.failure(response.response.content, response.response.type, response);
            },
            progress: function(event) {
              var _base;
              apptools.events.dispatch('RPC_PROGRESS', directive);
              if (typeof (_base = directive.response.events).progress === "function") {
                _base.progress(directive.request, event, directive);
              }
            }
          }));
        },
        send_rpc: function(directive) {
          var driver, queue_i, xhr, _base;
          driver = (_base = _this.state.config.jsonrpc).driver || (_base.driver = apptools.sys.drivers.resolve(RPCInterface));
          if (!(driver != null)) {
            apptools.dev.error('RPC', 'Failed to resolve RPC-compatible driver for prompted RPC directive.', driver, directive);
            throw "Failed to resolve RPC-compatible driver prompted RPC directive.";
          }
          queue_i = directive.queue_i = _this.state.requestpool.queue.push(_this.state.requestpool.index[directive.request.envelope.id]) - 1;
          xhr = directive.xhr = driver.rpc.factory(directive.request);
          apptools.events.dispatch('RPC_FULFILL', directive.request, directive.xhr, directive);
          driver.rpc.fulfill(directive.xhr, directive.request, function(status, response) {
            return _this.response.dispatch(status, directive, response);
          });
          return directive;
        },
        dispatch: function(directive, raw_response) {
          if (!(_this.state.requestpool.expect[_this.state.requestpool.index[directive.request.envelope.id]] != null)) {
            apptools.dev.error('RPC', 'Received a request to dispatch an unexpected RPC response.', directive);
            throw "Unexpected RPC response.";
            return _this;
          }
          return _this.state.requestpool.expect[_this.state.requestpool.index[directive.request.envelope.id]][directive.response.status](directive.response, directive.response.type, raw_response);
        }
      };
      this.request = {
        provision: function() {
          return _this.state.requestpool.id++;
        },
        factory: function(rpc, request_class) {
          var data_i, request;
          if (request_class == null) {
            request_class = RPCRequest;
          }
          request = new request_class(rpc);
          data_i = _this.state.requestpool.index[request.envelope.id] = _this.state.requestpool.data.push({
            request: request,
            response: new RPCResponse({
              id: request.envelope.id
            }),
            status: 'constructed'
          }) - 1;
          apptools.events.dispatch('RPC_CREATE', rpc, request, data_i);
          return request;
        },
        fulfill: function(request, callbacks, use_cache) {
          if (callbacks == null) {
            callbacks = {};
          }
          if (use_cache == null) {
            use_cache = false;
          }
          _this.state.requestpool.data[_this.state.requestpool.index[request.envelope.id]].response.callbacks(_.extend(_this.response.callbacks["default"], callbacks));
          return _this.internals.respond(_this.state.requestpool.data[_this.state.requestpool.index[request.envelope.id]], use_cache);
        },
        context: {
          "default": function(setdefault) {
            if (!!(setdefault != null)) {
              _this.state.requestpool.context = setdefault;
            }
            return _this.state.requestpool.context;
          },
          factory: function() {
            return (function(func, args, ctor) {
              ctor.prototype = func.prototype;
              var child = new ctor, result = func.apply(child, args);
              return Object(result) === result ? result : child;
            })(RPCContext, arguments, function(){});
          }
        }
      };
      this.response = {
        store: function(request, response) {
          return _this;
        },
        notify: function(status, directive, raw_response) {},
        dispatch: function(status, directive, raw_response) {
          if (status === 'failure') {
            directive.response = new RPCErrorResponse(directive.response, raw_response);
          }
          if (status !== 'failure') {
            directive.response.inflate(raw_response);
          }
          return _this.internals.dispatch(directive, raw_response);
        },
        callbacks: {
          "default": {
            notify: function(response) {
              return apptools.dev.verbose('RPC', 'Encountered notify RPC with no callback.', response);
            },
            success: function(response) {
              return apptools.dev.verbose('RPC', 'Encountered successful RPC with no callback.', response);
            },
            failure: function(response) {
              return apptools.dev.verbose('RPC', 'Encountered failing RPC with no error callback.', response);
            }
          }
        }
      };
      this.direct = {
        notify: function(payload) {},
        request: function(payload) {},
        response: function(payload) {},
        subscribe: function(payload) {},
        broadcast: function(payload) {}
      };
      this.service = {
        factory: function(name_or_apis, base_uri, methods, config) {
          var item, name, _j, _len1;
          if (!_.is_array(name_or_apis)) {
            name_or_apis = [name_or_apis];
          }
          for (_j = 0, _len1 = name_or_apis.length; _j < _len1; _j++) {
            item = name_or_apis[_j];
            name = item[0], methods = item[1], config = item[2];
            _this.state.servicepool.name_i[name] = _this.state.servicepool.rpc_apis.push(new RPCAPI(name, methods, config, apptools)) - 1;
            apptools.api[name] = _this.state.servicepool.rpc_apis[_this.state.servicepool.name_i[name]];
          }
          return _this;
        },
        register: function(service, methods, config) {
          return apptools.events.dispatch('CONSTRUCT_SERVICE', service, methods, config);
        }
      };
    }

    return CoreRPCAPI;

  })(CoreAPI);

  this.CoreServicesAPI = CoreServicesAPI = (function(_super) {

    __extends(CoreServicesAPI, _super);

    CoreServicesAPI.mount = 'api';

    CoreServicesAPI.events = ['SERVICES_INIT', 'CONSTRUCT_SERVICE'];

    function CoreServicesAPI(apptools, window) {
      var _this = this;
      this._init = function(apptools) {
        var _ref;
        if ((apptools.sys.state.config != null) && (((_ref = apptools.sys.state.config) != null ? _ref.services : void 0) != null)) {
          if (apptools.sys.state.config.services.endpoint != null) {
            apptools.rpc.state.config.jsonrpc.host = apptools.sys.state.config.services.endpoint;
          }
          if (apptools.sys.state.config.services.consumer != null) {
            apptools.rpc.state.config.consumer = apptools.sys.state.config.services.consumer;
          }
          apptools.events.dispatch('SERVICES_INIT', apptools.rpc.state.config);
          apptools.rpc.service.factory(apptools.sys.state.config.services.apis);
          apptools.dev.verbose('RPC', 'Autoloaded in-page RPC config.', apptools.sys.state.config.services);
        }
      };
    }

    return CoreServicesAPI;

  })(CoreAPI);

  _ref = [TransportInterface, RPCInterface, NativeXHR, RPCPromise, ServiceLayerDriver];
  for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
    i = _ref[_j];
    i.prototype.install(window, i);
  }

  this.__apptools_preinit.abstract_base_classes.push(CoreRPCAPI);

  this.__apptools_preinit.abstract_base_classes.push(CoreServicesAPI);

  DOMInterface = (function(_super) {

    __extends(DOMInterface, _super);

    function DOMInterface() {
      return DOMInterface.__super__.constructor.apply(this, arguments);
    }

    DOMInterface.prototype.capability = 'dom';

    DOMInterface.prototype.required = [];

    return DOMInterface;

  })(Interface);

  QueryInterface = (function(_super) {

    __extends(QueryInterface, _super);

    function QueryInterface() {
      return QueryInterface.__super__.constructor.apply(this, arguments);
    }

    QueryInterface.prototype.capability = 'query';

    QueryInterface.prototype.parent = DOMInterface;

    QueryInterface.prototype.required = ['element_by_id', 'elements_by_class', 'elements_by_tag', 'get'];

    QueryInterface.prototype.get = function(selector) {};

    QueryInterface.prototype.element_by_id = function(id) {};

    QueryInterface.prototype.elements_by_tag = function(tagname) {};

    QueryInterface.prototype.elements_by_class = function(classname) {};

    return QueryInterface;

  })(Interface);

  RenderInterface = (function(_super) {

    __extends(RenderInterface, _super);

    function RenderInterface() {
      return RenderInterface.__super__.constructor.apply(this, arguments);
    }

    RenderInterface.prototype.capability = 'render';

    RenderInterface.prototype.parent = DOMInterface;

    RenderInterface.prototype.required = [];

    RenderInterface.prototype.render = function(template, context) {};

    return RenderInterface;

  })(Interface);

  AnimationInterface = (function(_super) {

    __extends(AnimationInterface, _super);

    function AnimationInterface() {
      return AnimationInterface.__super__.constructor.apply(this, arguments);
    }

    AnimationInterface.prototype.capability = 'animation';

    AnimationInterface.prototype.parent = DOMInterface;

    AnimationInterface.prototype.required = ['animate'];

    AnimationInterface.prototype.animate = function(to, settings) {};

    return AnimationInterface;

  })(Interface);

  CoreRenderAPI = (function(_super) {

    __extends(CoreRenderAPI, _super);

    CoreRenderAPI.mount = 'render';

    CoreRenderAPI.events = [];

    CoreRenderAPI["export"] = 'private';

    function CoreRenderAPI(apptools, window) {
      return this;
    }

    return CoreRenderAPI;

  })(CoreAPI);

  RenderException = (function(_super) {

    __extends(RenderException, _super);

    function RenderException() {
      return RenderException.__super__.constructor.apply(this, arguments);
    }

    return RenderException;

  })(CoreException);

  Template = (function() {
    var blockre, fnre, tagre, valre, _re;

    Template["export"] = 'public';

    Template.idx = 0;

    Template.uuid = function() {
      this.idx++;
      return _.zero_fill(this.idx, 3);
    };

    blockre = /\{\{\s*?(([@!>]?)(.+?))\s*?\}\}(([\s\S]+?)(\{\{\s*?:\1\s*?\}\}([\s\S]+?))?)\{\{\s*?\/(?:\1|\s*?\3\s*?)\s*?\}\}/g;

    valre = /\{\{\s*?([<&=%\+])\s*?(.+?)\s*?\}\}/g;

    tagre = /\{\{[\w\W.]*\}\}/;

    fnre = /function\s?(\w*)\s?\(([\w\W.]*)\)\s?\{([\w\W.]*)\}/;

    _re = /[\r\n\t]*/g;

    function Template(source, compile, name) {
      var _this = this;
      if (compile == null) {
        compile = false;
      }
      this.t = source.replace(_re, '');
      this.name = name != null ? name : 'template_' + Template.uuid();
      this.temp = [];
      this.compile = function() {
        return Template.prototype.compile.apply(_this, arguments);
      };
      this.bind = function() {
        return Template.prototype.bind.apply(_this, arguments);
      };
      return (!!compile ? (compile.nodeType ? this.compile(this.bind(compile)) : this.compile(this)) : this);
    }

    Template.prototype.bind = function(element) {
      delete this.bind;
      this.node = element;
      this.env = document.createElement(this.node.tagName);
      return this;
    };

    Template.prototype.compile = function(th, strvar, ctxvar) {
      var body, depth, f, functionize, name, nodestr, template,
        _this = this;
      if (strvar == null) {
        strvar = 'str';
      }
      if (ctxvar == null) {
        ctxvar = 'ctx';
      }
      name = th.name;
      template = th.t;
      nodestr = name + '.node';
      console.log('[Render]', 'Compiling AppTools JS template:', name);
      depth = 0;
      functionize = function(string) {
        var b, ctxnow, end, index, live, newlive, start;
        b = '';
        ctxnow = depth > 0 ? '_val' : ctxvar;
        live = string.match(tagre);
        live = !!live ? live[0] : string;
        newlive = live;
        index = (!!~string.search(tagre) ? string.search(tagre) : string.length);
        if (index === -1 || index === live.length) {
          index = 0;
        }
        start = _this.safe(string.slice(0, index));
        end = _this.safe(string.slice(live.length + index));
        b += '\'';
        if (start.length > 0) {
          b += start;
        }
        if (blockre.test(live)) {
          newlive = newlive.replace(blockre, function(_, __, meta, key, inner, if_true, has_else, if_false) {
            var keystr, loopstr, loopvar, temp, _valstr;
            temp = start.length > 0 ? '\';' : '';
            keystr = [ctxnow, key].join('.');
            if (meta === '' || !meta) {
              temp += 'if(!!' + keystr + '){' + strvar + '+=' + functionize(if_true);
              if (has_else) {
                temp += '}else{' + strvar + '+=' + functionize(if_false);
              }
            } else if (meta === '!') {
              temp += 'if(!' + keystr + '){' + strvar + '+=' + functionize(inner);
            } else if (meta === '@' || meta === '>') {
              loopstr = '_' + key.slice(0, 2) + key.slice(key.length - 2);
              loopvar = '_' + loopstr;
              _valstr = loopstr + '[' + loopvar + ']';
              if (meta === '>') {
                depth++;
              }
              temp += 'var ' + loopstr + '=' + keystr + ';for(var ' + loopvar + ' in ' + loopstr + '){';
              temp += meta === '@' ? ctxvar + '._key=' + loopvar + ';' + ctxvar + '._val=' + _valstr : '_val=' + _valstr;
              temp += ';' + strvar + '+=';
              temp += functionize(inner);
              if (meta === '>') {
                temp += ';_val=null;';
                depth--;
              }
            }
            temp += '}';
            if (end.length > 0) {
              temp += strvar + '+=\'';
            }
            return temp;
          });
        }
        if (valre.test(newlive)) {
          newlive = newlive.replace(valre, function(_, meta, key) {
            var valstr;
            if (meta === '+') {
              valstr = 'this.' + key + '(false,' + ctxnow + ')';
            } else if (meta === '&') {
              key = parseInt(key);
              if (String(key) !== 'NaN') {
                valstr = name + '.temp[' + (key - 1) + ']';
              }
            } else {
              valstr = [ctxnow, key].join('.');
            }
            return '\'+' + (meta === '%' ? 'Template.prototype.scrub(' + valstr + ')' : meta === '<' ? '(' + name + '.temp.push(' + valstr + '),' + valstr + ')' : valstr) + '+\'';
          });
        }
        b += newlive;
        b += '\'';
        if (end.length > 0) {
          b += '+\'' + end + '\'';
        }
        return b;
      };
      body = [name + ' = (function() {', name + '.name = \'' + name + '\';', 'function ' + name + ' (' + ctxvar + ') {', 'var _val,n=' + nodestr + ',', 'dom=(typeof ' + ctxvar + '==\'boolean\')?', '(c = ' + ctxvar + ', ' + ctxvar + ' = arguments[1], c)', ':true;var ' + strvar + '=', functionize(template), ';return (' + name + '.temp=[], (dom && n != null)?', 'n.outerHTML=' + strvar, ':' + strvar + ');}', 'return ' + name + ';}).call(this);', 'return ' + name + ';'].join('');
      f = new Function('', body)();
      if (th.env != null) {
        f.node = th.node;
      } else {
        f.bind = function(el) {
          this.node = el;
          delete this.bind;
          return this.node;
        };
      }
      console.log('[Render]', 'Template compiled:', String(f).replace(/\{[\w\W.]*\}/, '{...}'));
      return f;
    };

    Template.prototype.parse = function(fragment, vars) {
      var _this = this;
      if (!(vars != null)) {
        vars = fragment;
        fragment = this.t;
      }
      if (vars._ctx) {
        vars = vars._ctx;
      }
      if (vars.tag && vars.attrs) {
        return _create_element_string(vars.tag, vars.attrs, vars.separator);
      } else {
        return fragment.replace(blockre, function(_, __, meta, key, inner, if_true, has_else, if_false) {
          var item, k, temp, v, val, _k, _len2;
          val = _this.get_value(vars, key);
          temp = '';
          if (!val) {
            return (meta === '!' ? _this.parse(inner, vars) : (has_else ? _this.parse(if_false, vars) : ''));
          }
          if (!meta) {
            return _this.parse(has_else ? if_true : inner, vars);
          }
          if (meta === '@') {
            for (k in val) {
              v = val[k];
              if (val.hasOwnProperty(k)) {
                temp += _this.parse(inner, {
                  _key: k,
                  _val: v
                });
              }
            }
          }
          if (meta === '>') {
            if (Array.isArray(val) || val.constructor.name === 'ListField') {
              for (_k = 0, _len2 = val.length; _k < _len2; _k++) {
                item = val[_k];
                temp += _this.parse(inner, {
                  _ctx: item
                });
              }
            } else {
              temp += _this.parse(inner, {
                _ctx: val
              });
            }
          }
          return temp;
        }).replace(valre, function(_, meta, key) {
          var child, val;
          if (meta === '&') {
            return _this.temp[parseInt(key) - 1];
          }
          if (meta === '+') {
            child = new Function('', 'return this.' + key + ';')();
            return child(vars);
          }
          val = _this.get_value(vars, key);
          if (meta === '<') {
            _this.temp.push(val);
          }
          return (val != null ? (meta === '%' ? _this.scrub(val) : val) : '');
        });
      }
    };

    Template.prototype.unparse = function(element) {
      var attr, depth, elobj, parent, _k, _len2, _ref1;
      elobj = {
        attributes: {}
      };
      parent = element.parentNode;
      depth = 0;
      elobj.tagName = element.tagName;
      _ref1 = element.attributes;
      for (_k = 0, _len2 = _ref1.length; _k < _len2; _k++) {
        attr = _ref1[_k];
        elobj.attributes[attr.name] = attr.nodeValue;
      }
      elobj.innerHTML = element.innerHTML;
      if (!parent.hasAttribute('id')) {
        while ((depth++, parent = parent.parentNode)) {
          if (!parent.hasAttribute('id')) {
            continue;
          }
          break;
        }
      }
      elobj.parent = parent.getAttribute('id');
      elobj.depth = depth;
      return elobj;
    };

    Template.prototype.scrub = function(val) {
      return new Option(val).innerHTML.split('\'').join('&#39;').split('"').join('&quot;');
    };

    Template.prototype.safe = function(val) {
      return val.split('\'').join('&#39;');
    };

    Template.prototype.get_value = function(vars, key) {
      var parts;
      parts = key.split('.');
      while (parts.length) {
        if (!(parts[0] in vars)) {
          return false;
        }
        vars = vars[parts.shift()];
      }
      return (typeof vars === 'function' ? vars() : vars);
    };

    Template.prototype.template = function(t) {
      this.t = t;
      return this;
    };

    Template.prototype.render = function(ctx) {
      var c, dom, html, newnode;
      dom = typeof ctx === 'boolean' ? (c = ctx, ctx = arguments[1], c) : true;
      if (!(ctx != null)) {
        return false;
      }
      html = this.parse(ctx);
      if (!dom || !(this.env != null)) {
        return html;
      }
      this.env.appendChild(this.node.cloneNode(false));
      this.env.firstChild.outerHTML = html;
      newnode = this.env.firstChild;
      if (dom) {
        this.node.parentNode.insertBefore(newnode, this.node);
      }
      this.node = newnode;
      return this.node;
    };

    return Template;

  })();

  window.t = Template;

  TemplateLoader = (function() {

    function TemplateLoader() {
      var _this = this;
      this.load = function(pre_template) {
        console.log(_this.constructor.name, 'Loading templates from a remote service is currently stubbed.');
        return pre_template;
      };
      return this;
    }

    return TemplateLoader;

  })();

  TemplateAPI = (function(_super) {

    __extends(TemplateAPI, _super);

    TemplateAPI.mount = 'templates';

    TemplateAPI.events = [];

    TemplateAPI["export"] = 'private';

    function TemplateAPI(apptools, window) {
      var _this = this;
      this._state = {
        data: [],
        index: {},
        count: 0,
        init: false
      };
      this._init = function() {
        var name, raw, singleton, t, templates, _t;
        _this.outerHTML = function(html, fn) {
          var env, n;
          env = document.createElement('div');
          env.appendChild(this.cloneNode(false));
          env.firstChild.outerHTML = html;
          n = env.firstChild;
          this.parentNode.insertBefore(n, this);
          fn.cache.push(this.parentNode.removeChild(this));
          fn.node = n;
          fn.node.__defineSetter__('outerHTML', function(html) {
            return $.apptools.templates.outerHTML.call(this, html, fn);
          });
          return n;
        };
        if (window.templates && _.is_array(window.templates)) {
          templates = window.templates;
          window.templates = {};
          while ((t = templates.shift())) {
            t = t.call(window, window);
            if (t.name.match(/system/gi)) {
              t.singleton = true;
              t.cache = [];
              t.__defineSetter__('node', function(n) {
                this.cache.push(this.current);
                this.current = n;
                return this;
              });
              t.__defineGetter__('node', function() {
                return this.current;
              });
            } else {
              t.bind = function(el) {
                this.node = el;
                delete this.bind;
                return this;
              };
            }
            t.temp = [];
            window.templates[t.name] = t;
            continue;
          }
        } else {
          if (_('#templates') != null) {
            if (_('#templates').find != null) {
              templates = _.to_array(_('#templates').find('script')) || [];
              window.templates = {};
              while ((t = templates.shift())) {
                singleton = !!t.data('singleton');
                name = t.getAttribute('id');
                raw = t.innerText.replace(/[\r\t\n]/g, '').replace(/\s{3,}/g, '');
                _t = _this.make(name, raw.replace(/\[\[\[\s*?([^\]]+)\s*?\]\]\]/g, function(_, inner) {
                  return '{{' + inner + '}}';
                }));
                _t.temp = [];
                if (singleton) {
                  _t.singleton = true;
                  _t.cache = [];
                  _t.__defineSetter__('node', function(n) {
                    this.cache.push(this.current);
                    this.current = n;
                    return this;
                  });
                  _t.__defineGetter__('node', function() {
                    return this.current;
                  });
                } else {
                  _t.bind = function(el) {
                    this.node = el;
                    delete this.bind;
                    return this;
                  };
                }
                t.remove();
                window.templates[name] = _t;
                continue;
              }
            }
          }
        }
        delete _this._init;
        _this._state.init = true;
        return _this;
      };
      this.register = function(name, template) {
        var ni, uuid;
        if ((ni = _this._state.index[name]) != null) {
          return _this._state.data[ni];
        }
        if (!(template != null) && _.is_raw_object(name)) {
          template = name.template;
          name = name.name;
        }
        if (!!!template) {
          return false;
        } else {
          template.uuid = (uuid = Template.uuid());
          _this._state.index[uuid] = _this._state.index[name] = _this._state.data.push(template) - 1;
          _this._state.count++;
          return template;
        }
      };
      this.make = this.create = function(name, source) {
        var _tpl;
        if (_this._state.index[name] != null) { return false; }
        _tpl = new Template(source, false, name);
        apptools.dev.log('Render', 'Registering template:', name, _tpl)
        return _this.register(name, _tpl);
      };
      this.get = function(name_or_uuid) {
        var n;
        return ((n = _this._state.index[name_or_uuid]) != null ? _this._state.data[n] : false);
      };
      return this;
    }

    return TemplateAPI;

  })(CoreAPI);

  this.__apptools_preinit.abstract_base_classes.push(QueryInterface, RenderInterface, AnimationInterface, RenderException, Template, TemplateLoader, TemplateAPI, CoreRenderAPI);

  this.__apptools_preinit.abstract_feature_interfaces.push(DOMInterface, QueryInterface, RenderInterface, AnimationInterface);

  this.__apptools_preinit.deferred_core_modules.push({
    module: TemplateAPI
  });

  AppTools = (function() {

    AppTools.version = {
      major: 0,
      minor: 1,
      micro: 5,
      build: 8272012,
      release: "BETA",
      get: function() {
        var x;
        return [
          [
            [
              (function() {
                var _k, _len2, _ref1, _results;
                _ref1 = [this.major, this.minor, this.micro];
                _results = [];
                for (_k = 0, _len2 = _ref1.length; _k < _len2; _k++) {
                  x = _ref1[_k];
                  _results.push(x.toString());
                }
                return _results;
              }).call(this)
            ].join('.'), this.build.toString()
          ].join('-'), this.release
        ].join(' ');
      }
    };

    function AppTools(window) {
      var config, config_string, module, page_config, _k, _len2, _ref1, _ref2,
        _this = this;
      config = {
        transport: {
          rpc: {
            host: null,
            enabled: true,
            base_uri: '/_api/rpc'
          },
          sockets: {
            host: null,
            enabled: false,
            endpoint: '/_api/realtime'
          }
        },
        devtools: {
          debug: true,
          strict: false
        }
      };
      this.lib = {};
      this.sys = {
        platform: {},
        version: this.version,
        core_events: ['SYS_MODULE_LOADED', 'SYS_LIB_LOADED', 'SYS_DRIVER_LOADED', 'PLATFORM_READY'],
        state: {
          core: [],
          config: {},
          status: 'NOT_READY',
          flags: ['base', 'beta'],
          preinit: {},
          modules: {},
          classes: {},
          drivers: {},
          interfaces: {},
          integrations: [],
          add_flag: function(flagname) {
            return _this.sys.state.flags.push(flagname);
          },
          consider_preinit: function(preinit) {
            var cls, lib, _driver, _iface, _k, _l, _len2, _len3, _len4, _len5, _m, _n, _ref1, _ref2, _ref3, _ref4;
            if (preinit.abstract_base_classes != null) {
              _ref1 = preinit.abstract_base_classes;
              for (_k = 0, _len2 = _ref1.length; _k < _len2; _k++) {
                cls = _ref1[_k];
                _this.sys.state.classes[cls.name] = cls;
                if ((cls["package"] != null) && (_this.sys.state.modules[cls["package"]] != null)) {
                  _this.sys.state.modules[cls["package"]].classes[cls.name] = cls;
                }
                if ((cls["export"] != null) && cls["export"] === 'private') {
                  continue;
                } else {
                  window[cls.name] = cls;
                }
              }
            }
            if (preinit.deferred_library_integrations != null) {
              _ref2 = preinit.deferred_library_integrations;
              for (_l = 0, _len3 = _ref2.length; _l < _len3; _l++) {
                lib = _ref2[_l];
                _this.sys.libraries.install(lib.name, lib.library);
              }
            }
            if (preinit.abstract_feature_interfaces != null) {
              _ref3 = preinit.abstract_feature_interfaces;
              for (_m = 0, _len4 = _ref3.length; _m < _len4; _m++) {
                _iface = _ref3[_m];
                _this.sys.interfaces.install(_iface);
              }
            }
            if (preinit.installed_drivers != null) {
              _ref4 = preinit.installed_drivers;
              for (_n = 0, _len5 = _ref4.length; _n < _len5; _n++) {
                _driver = _ref4[_n];
                _this.sys.drivers.install(_driver);
              }
            }
            return preinit;
          }
        },
        modules: {
          install: function(module_or_modules, mountpoint_or_callback, callback) {
            var finished_modules, module, module_name, modules, mountpoint, pass_parent, target_mod, _base, _k, _len2;
            if (mountpoint_or_callback == null) {
              mountpoint_or_callback = null;
            }
            if (callback == null) {
              callback = null;
            }
            if (!_.is_array(module_or_modules) || ((mountpoint_or_callback != null) || (callback != null))) {
              modules = [module_or_modules];
            } else {
              modules = module_or_modules;
            }
            if (mountpoint_or_callback != null) {
              if (typeof mountpoint_or_callback === 'function') {
                callback = mountpoint_or_callback;
                mountpoint = null;
              } else {
                mountpoint = mountpoint_or_callback;
              }
            }
            if (mountpoint != null) {
              if (!(_this[mountpoint] != null)) {
                _this[mountpoint] = {};
              }
              mountpoint = _this[mountpoint];
              pass_parent = true;
            } else {
              mountpoint = _this;
              pass_parent = false;
            }
            finished_modules = [];
            for (_k = 0, _len2 = modules.length; _k < _len2; _k++) {
              module = modules[_k];
              if (module.mount != null) {
                module_name = module.mount;
              } else {
                module_name = module.name.toLowerCase();
              }
              if ((module.events != null) && (_this.events != null)) {
                _this.events.register(module.events);
              }
              if (!(mountpoint[module_name] != null)) {
                if (pass_parent) {
                  target_mod = new module(_this, mountpoint, window);
                  mountpoint[module_name] = target_mod;
                  _this.sys.state.modules[module_name] = {
                    module: target_mod,
                    classes: {}
                  };
                } else {
                  target_mod = new module(_this, window);
                  mountpoint[module_name] = target_mod;
                  _this.sys.state.modules[module_name] = {
                    module: target_mod,
                    classes: {}
                  };
                }
              }
              if (typeof (_base = mountpoint[module_name])._init === "function") {
                _base._init(_this);
              }
              delete mountpoint[module_name]._init;
              if ((_this.dev != null) && (_this.dev.verbose != null)) {
                _this.dev.verbose('ModuleLoader', 'Installed module:', target_mod, ' at mountpoint: ', mountpoint, ' under the name: ', module_name);
              }
              if (_this.events != null) {
                _this.events.trigger('SYS_MODULE_LOADED', {
                  module: target_mod,
                  mountpoint: mountpoint
                });
              }
              if (callback != null) {
                callback(target_mod);
              }
              finished_modules.push(target_mod);
            }
            return finished_modules;
          }
        },
        libraries: {
          install: function(name, library, callback) {
            if (callback == null) {
              callback = null;
            }
            _this.lib[name.toLowerCase()] = library;
            _this.sys.state.integrations.push(name.toLowerCase());
            _this.dev.verbose('Library', name + ' detected.');
            _this.events.trigger('SYS_LIB_LOADED', {
              name: name,
              library: library
            });
            if (callback != null) {
              callback(library, name);
            }
            return _this.lib[name.toLowerCase()];
          },
          resolve: function(name) {
            name = name.toLowerCase();
            if (_this.lib[name.toLowerCase()] != null) {
              return _this.lib[name.toLowerCase()];
            }
          }
        },
        interfaces: {
          install: function(adapter) {
            if ((adapter.name != null) && (adapter.adapter != null)) {
              adapter = new adapter.adapter(_this);
            } else {
              adapter = new adapter(_this);
            }
            _this.dev.verbose('Interface', 'Installed "' + adapter.capability + '" interface.', adapter);
            if (adapter.parent !== null) {
              if (_.is_string(adapter.parent)) {
                if (!(_this.sys.state.interfaces[adapter.parent] != null)) {
                  _this.dev.error('System', 'Encountered interface with invalid parent reference.', adapter, adapter.parent);
                  throw "Parent interface references must be valid and child interfaces must be loaded after their parents.";
                } else {
                  _this.sys.state.interfaces[adapter.parent].children[adapter.capability] = {
                    adapter: adapter,
                    children: {}
                  };
                  _this.events.trigger('SYS_INTERFACE_LOADED', {
                    adapter: _this.sys.state.interfaces[adapter.parent].children[adapter.capability].adapter
                  });
                }
              } else {
                if (!(_this.sys.state.interfaces[adapter.parent.prototype.capability] != null)) {
                  _this.dev.error('System', 'Encountered interface with invalid parent reference.', adapter, adapter.parent);
                  throw "Parent interface references must be valid and child interfaces must be loaded after their parents.";
                } else {
                  _this.sys.state.interfaces[adapter.parent.prototype.capability].children[adapter.capability] = {
                    adapter: adapter,
                    children: {}
                  };
                  _this.events.trigger('SYS_INTERFACE_LOADED', {
                    adapter: _this.sys.state.interfaces[adapter.parent.prototype.capability].children[adapter.capability].adapter
                  });
                }
              }
            } else {
              _this.sys.state.interfaces[adapter.capability] = {
                adapter: adapter,
                children: {}
              };
              _this.events.trigger('SYS_INTERFACE_LOADED', {
                adapter: _this.sys.state.interfaces[adapter.capability].adapter
              });
            }
            return _this.sys.state.interfaces[adapter.capability];
          },
          resolve: function(iface) {
            var n, spec, _ref1, _ref2, _ref3;
            if (!_.is_string(iface)) {
              if (iface.prototype.parent != null) {
                spec = [iface.prototype.parent.prototype.capability, iface.prototype.capability].join('.');
              } else {
                spec = iface.prototype.capability;
              }
            } else {
              spec = String(iface).toLowerCase();
            }
            n = spec.split('.');
            if (n.length > 1) {
              if (((_ref1 = _this.sys.state.interfaces[n[0]]) != null ? _ref1.children[n[1]] : void 0) != null) {
                return (_ref2 = _this.sys.state.interfaces[n[0]]) != null ? (_ref3 = _ref2.children[n[1]]) != null ? _ref3.adapter : void 0 : void 0;
              }
              return false;
            }
            if (_this.sys.state.interfaces[spec] != null) {
              if (_this.sys.state.interfaces[spec] != null) {
                return _this.sys.state.interfaces[spec].adapter;
              }
              return false;
            }
          },
          children: function(iface) {
            if (!_.is_string(iface)) {
              iface = iface.capability;
            }
            if (iface.contains(".")) {
              return false;
            }
            if (!(_this.sys.state.interfaces[iface] != null)) {
              _this.dev.error('Failed to resolve interface children for missing interface "' + iface + '".');
              throw 'Failed to resolve interface children for missing interface "' + iface + '".';
            }
            return _this.sys.state.interfaces[iface].children;
          }
        },
        drivers: {
          install: function(driver) {
            var iface, interfaces, method, _k, _l, _len2, _len3, _ref1, _results;
            if (!_.is_string(driver.name)) {
              _this.dev.error('System', 'Encountered driver without a valid name.', driver, driver.name);
              throw "Drivers must have a string name attached at `driver.name`.";
            }
            if (_this.sys.state.drivers[driver.name] != null) {
              return _this.dev.log('System', 'Encountered a driver conflict installing "' + driver.name + '".', 'original: ', _this.sys.state.drivers[driver.name], 'conflict: ', driver);
            } else {
              if (((driver.prototype["native"] != null) && driver.prototype["native"] === true) || ((driver.prototype.library != null) || ((driver.prototype.compatible != null) && (driver.prototype.compatible() === true)))) {
                interfaces = (function() {
                  var _k, _len2, _ref1, _results;
                  _ref1 = driver.prototype["interface"];
                  _results = [];
                  for (_k = 0, _len2 = _ref1.length; _k < _len2; _k++) {
                    iface = _ref1[_k];
                    _results.push(this.sys.interfaces.resolve(iface));
                  }
                  return _results;
                }).call(_this);
                if (driver.prototype.library != null) {
                  driver = _this.sys.state.drivers[driver.name] = new driver(driver.prototype.library, _this, window);
                } else {
                  driver = _this.sys.state.drivers[driver.name] = new driver(_this, window);
                }
                _results = [];
                for (_k = 0, _len2 = interfaces.length; _k < _len2; _k++) {
                  iface = interfaces[_k];
                  if (!(driver[iface.capability] != null)) {
                    _this.dev.warning('System', 'Encountered driver ("' + driver.name + '") with incomplete implementation for interface "' + iface.capability + '".', iface, driver);
                  }
                  if (iface.required != null) {
                    _ref1 = iface.required;
                    for (_l = 0, _len3 = _ref1.length; _l < _len3; _l++) {
                      method = _ref1[_l];
                      if (!(driver[iface.capability][method] != null)) {
                        _this.dev.error('System', 'Encountered driver ("' + driver.name + '") without required implementation method ("' + method + '") for attached interface "' + iface.capability + '".', iface, driver);
                        throw "Encountered fatal driver validation error.";
                      }
                    }
                  }
                  _results.push(iface.add(driver));
                }
                return _results;
              } else {
                _this.dev.verbose('System', 'Installed driver "' + driver.name + '" was found to be incompatible with the current environment.');
                return false;
              }
            }
          },
          resolve: function(spec, name) {
            var iface;
            if (name == null) {
              name = null;
            }
            iface = _this.sys.interfaces.resolve(spec);
            return iface.resolve(name);
          }
        },
        go: function(apptools) {
          apptools.dev.log('Core', 'All systems go.');
          apptools.sys.state.status = 'READY';
          apptools.events.trigger('PLATFORM_READY', apptools);
          return _this;
        }
      };
      if ((window.config != null) && _.is_object(window.config)) {
        page_config = window.config;
        this.sys.state.config = _.extend(config, this.sys.state.config, window.config);
      } else {
        config_string = window._cfgst || 'js-config';
        page_config = document.getElementById(config_string);
        if (page_config != null) {
          this.sys.state.config = _.extend(config, this.sys.state.config, JSON.parse(page_config.innerText));
        } else {
          this.sys.state.config = _.extend({}, config, this.sys.state.config);
        }
      }
      if (this.sys.state.config.debug != null) {
        CoreDevAPI.prototype.debug = _.extend({}, CoreDevAPI.prototype.debug, this.sys.state.config.debug);
      }
      this.sys.modules.install(CoreDevAPI, function(dev) {
        return _this.sys.modules.install(CoreEventsAPI, function(events) {
          return events.register(_this.sys.core_events);
        });
      });
      this.sys.state.preinit = window.__apptools_preinit || window.__preinit;
      if (this.sys.state.preinit != null) {
        this.sys.state.consider_preinit(window.__apptools_preinit);
      }
      this.sys.state.core = [CoreModelAPI, CoreAgentAPI, CoreRPCAPI, CoreServicesAPI, CoreRenderAPI];
      this.sys.modules.install(this.sys.state.core);
      if (((_ref1 = window.__apptools_preinit) != null ? _ref1.deferred_core_modules : void 0) != null) {
        _ref2 = window.__apptools_preinit.deferred_core_modules;
        for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
          module = _ref2[_k];
          if (module["package"] != null) {
            this.sys.modules.install(module.module, module["package"]);
          } else {
            this.sys.modules.install(module.module);
          }
        }
      }
      if (window.__clock != null) {
        if (this.analytics != null) {
          this.dev.verbose('Analytics', 'Installing Google Analytics timings integration.');
          window.__clock.track = function(timing) {
            var args, category, label, now, sample_rate, start_time, variable;
            now = timing[0], args = timing[1];
            category = args[0], variable = args[1], start_time = args[2], label = args[3], sample_rate = args[4];
            _this.analytics.track.timing(category, variable, Math.floor(now) - Math.floor(start_time), label, sample_rate);
            return timing;
          };
        }
      }
      return this.sys.go(this);
    }

    return AppTools;

  })();

  window.AppTools = AppTools;

  window.apptools = new AppTools(window);

  if (window.jQuery != null) {
    $.extend({
      apptools: window.apptools
    });
  } else if (window.$ != null) {
    window.$.apptools = window.apptools;
  } else {
    (window.$ = function(x) {
      return document.getElementById(x);
    }).apptools = window.apptools;
  }

  if (window.__clock != null) {
    window.__clock.clockpoint('JavaScript', 'Platform Ready', window.__clock.ts[0], 'AppTools', 100);
  }

}).call(this);
