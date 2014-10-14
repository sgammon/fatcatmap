/*jshint -W030 */
/**
 * @fileoverview Core service injection methods.
 *
 * @author  David Rekow <david@momentum.io>,
 *          Sam Gammon <sam@momentum.io>,
 *          Alex Rosner <alex@momentum.io>,
 *          Ian Weisberger <ian@momentum.io>
 *
 * copyright (c) momentum labs, 2014
 */

goog.require('util.object');
goog.require('event');

goog.provide('service');

var ServiceContext, Service;

/**
 * Service injection point - instances of this class have access to all provided services.
 * @constructor
 */
ServiceContext = function () {};

ServiceContext.prototype = {
  /**
   * @param {string} name
   * @param {(Service|function(this: ServiceContext, ...[*]))} service
   * @return {(Service|function(this: ServiceContext, ...[*]))}
   */
  inject: function (name, service) {
    util.object.resolveAndSet(ServiceContext.prototype, name, service);
    return service;
  }
};

/**
 * @static
 * @param {string} name
 * @param {(Service|function(this: ServiceContext, ...[*]))} service
 * @return {(Service|function(this: ServiceContext, ...[*]))}
 */
ServiceContext.inject = ServiceContext.prototype.inject;

/**
 * ServiceContext-injected class.
 * @constructor
 * @extends {event.Emitter}
 * @param {string} name
 * @param {Object.<string, function(...)>=} methods
 * @throws {TypeError} If name is not a string.
 */
Service = function (name, methods) {
  if (typeof name !== 'string')
    throw new TypeError('Service() requires a service name to inject at.');

  event.Emitter.call(this);

  if (methods) {
    for (var k in methods) {
      if (methods.hasOwnProperty(k) && methods[k] instanceof Function)
        this[k] = methods[k];
    }
  }

  ServiceContext.inject(name, this);
};

Service.prototype = new ServiceContext();

util.object.mixin(Service, event.Emitter);

Object.defineProperty(Function.prototype, 'inject', {
  /**
   * @expose
   * @param {(string|Array.<string>)=} _services
   * @return {function(this: ServiceContext, ...[*])}
   * @throws {TypeError}
   */
  value: /** @this {Function} */ function (_services) {
    var fn = this,
      inject,
      injected,
      injector,
      ctor;

    if (fn.__injected__)
      return fn;

    if (!_services)
      _services = [];

    if (_services && !Array.isArray(_services)) {
      if (typeof _services !== 'string')
        throw new TypeError('inject() requires a service name or list of names.');

      _services = [_services];
    }

    _services.forEach(function (serviceName) {
      if (!inject)
        inject = {};

      util.object.resolveAndSet(
        inject, serviceName, util.object.resolve(ServiceContext.prototype, serviceName));
    });

    /**
     * @constructor
     */
    injected = function () {};
    injected.prototype = inject || new ServiceContext();

    injector = function () {
      /*jshint newcap:false */
      return fn.apply(new injected(), arguments);
    };

    injector.__injected__ = services.length ? services : true;

    return injector;
  }
});

/**
 * @expose
 * @param {(string|Array.<string>)=} _services
 * @return {function(...)}
 */
Function.prototype.inject;


Object.defineProperty(Function.prototype, 'service', {
  /**
   * @expose
   * @param {string} name Service name.
   * @return {function(this: ServiceContext, ...[*])}
   * @this {Function}
   */
   value: function (name) {
    return ServiceContext.inject(name, this.inject());
  }
});

/**
 * @expose
 * @param {string} name Service name.
 * @param {Object.<string, function(...)>=} methods
 * @return {function(...)}
 */
Function.prototype.service;


Object.defineProperty(Object.prototype, 'service', {
  /**
   * @expose
   * @param {string} name Service name.
   * @return {ServiceContext}
   * @throws {Error|TypeError}
   * @this {Object}
   */
  value: function (name) {
    return new Service(name, this);
  }
});

/**
 * @expose
 * @param {string} name Service name.
 * @return {Object.<string, (function(this:Service)|Object.<string, function(this:Service)>)>}
 * @throws {Error|TypeError}
 */
Object.prototype.service;
