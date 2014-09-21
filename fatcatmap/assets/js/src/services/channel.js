/**
 * @fileoverview Fatcatmap channel service - provides messaging over multiple transports.
 *
 * @author  David Rekow <david@momentum.io>,
 *          Sam Gammon <sam@momentum.io>,
 *          Alex Rosner <alex@momentum.io>,
 *          Ian Weisberger <ian@momentum.io>
 * 
 * copyright (c) momentum labs, 2014
 */

goog.require('util.object');
goog.require('supports');
goog.require('services');
goog.require('services.rpc');
goog.require('services.http');
goog.require('services.socket');

goog.provide('services.channel');

var SUPPORTED_TRANSPORTS = {
  /**
   * @expose
   */
  rpc: services.rpc,

  /**
   * @expose
   */
  http: services.http,

  /**
   * @expose
   */
  socket: services.socket
},

  TRANSPORTS = {},

  _transportExtending = false,

  Transport, RPCTransport, HTTPTransport, SocketTransport,
  Channel;

/**
 * @constructor
 * @param {string} type
 * @throws {Error} If <code>type</code> is not supported.
 */
Transport = function (type) {
  if (this.constructor === Transport) {
    if (!_transportExtending)
      console.warn('Transport() should not be instantiated directly.');

    return;
  }

  if (!SUPPORTED_TRANSPORTS[type])
    throw new Error('Transport type "' + type + '" is not supported.');
};


/**
 * @abstract
 * @param {Message} message
 * @return {*}
 * @throws {Error} If not overridden by subclasses.
 */
Transport.prototype.serialize = function (message) {
  throw new Error('Transport.serialize() must be overridden by subclasses.');
};

/**
 * @abstract
 * @param {*} serialized
 * @return {Message}
 * @throws {Error} If not overridden by subclasses.
 */
Transport.prototype.deserialize = function (serialized) {
  throw new Error('Transport.deserialize() must be overridden by subclasses.');
};

/**
 * @abstract
 * @param {Message} message
 * @throws {Error} If not overridden by subclasses.
 */
Transport.prototype.dispatch = function (message) {
  throw new Error('Transport.dispatch() must be overridden by subclasses.');
};

/**
 * @abstract
 * @param {*} incoming
 * @return {Message}
 * @throws {Error} If not overridden by subclasses.
 */
Transport.prototype.receive = function (incoming) {
  throw new Error('Transport.receive() must be overridden by subclasses.');
};

/**
 * @static
 * @param {string} type
 * @param {Object.<string, function>} proto
 * @return {function(new:Transport, string)}
 * @throws {Error} If <code>type</code> has already been extended.
 */
Transport.extend = function (type, proto) {
  var k, ctor;

  if (TRANSPORTS[type])
    throw new Error('Transport.extend() has already been called for type ' + type + '.');

  ctor = function () { Transport.call(this, type); };

  _transportExtending = true;
  ctor.prototype = new Transport();
  _transportExtending = false;

  for (k in proto) {
    if (proto.hasOwnProperty(k) && typeof proto[k] === 'function')
      ctor.prototype[k] = proto[k];
  }

  TRANSPORTS[type] = ctor;

  return ctor;
};

/**
 * @constructor
 */
RPCTransport = Transport.extend('rpc', /** @lends {RPCTransport.prototype} */{
  /**
   * @param {(Message|Request)} message
   * @return {Request}
   */
  serialize: function (message) {
    var options = message.meta || message;

    return {
      data: message.content || message.data,
      params: options.params,
      headers: options.headers
    };
  },

  /**
   * @param {(Message|Response|*)} serialized
   * @return {Message}
   */
  deserialize: function (serialized) {
    var message = {
      meta: {},
      content: serialized.data
    };

    if (serialized.headers)
      message.meta.headers = serialized.headers;

    return message;
  },

  /**
   * @param {(Message|Request)} message
   * @throws {Error} If no rpc method is specified.
   */
  dispatch: function (message) {
    var rpcTransport = this,
      method = message.method,
      dispatcher;

    if (typeof method !== 'string')
      throw new Error('RPCTransport.dispatch() expects a message with a "method" property.');

    dispatcher = util.object.resolve(SUPPORTED_TRANSPORTS.rpc, method);

    if (typeof dispatcher !== 'function') {
      console.warn('RPCTransport.dispatch() could not resolve dispatcher for method "' +
        method + '".');

      return;
    }

    dispatcher(this.serialize(message), function (response, error) {
      if (error)
        // @TODO david: handle propagating transport errors up to Channel listeners
        return;

      rpcTransport.receive(response);
    });
  },

  /**
   * @param {(Message|Response|*)} incoming
   */
  receive: function (incoming) {
    // @TODO david: handle propagating responses up to Channel listeners
  }
});


/**
 * @constructor
 * @param {MessageCallbackMap=} listeners
 */
Channel = function (listeners) {
  /**
   * @protected
   * @type {Object.<{
   *   message: Array.<function(Object)>,
   *   error: Array.<function(Error)>
   * }>}
   */
  this._events = {
    /**
     * @expose
     */
    message: [],

    /**
     * @expose
     */
    error: []
  };

  if (listeners.message)
    this._events.message.push(listeners.message);

  if (listeners.error)
    this._events.error.push(listeners.error);
};


/**
 * Add a listener for <code>message</code> or <code>error</code> events.
 * @param {string} event
 * @param {(function(Object)|function(Error))} listener
 */
Channel.prototype.on = function (event, listener) {
  if (this._events[event])
    this._events[event].push(listener);
};

/**
 * Remove a listener for <code>message</code> or <code>error</code> events.
 * @param {string} event
 * @param {(function(Object)|function(Error))=} listener
 */
Channel.prototype.off = function (event, listener) {
  var events, eventI;
  
  if (this._events[event]) {
    events = this._events[event];
    
    if (listener) {
      eventI = events.indexOf(listener);

      if (eventI > -1)
        events.splice(eventI, 1);
    } else {
      events = [];
    }

    this._events[event] = events;
  }
};


/**
 * @expose
 */
services.channel = /** @lends {ServiceContext.prototype.channel} */ {
}.service('channel');
