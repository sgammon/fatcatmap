/**
 * @fileoverview Routing module, using HTML5 history manager.
 *
 * @author  David Rekow <david@momentum.io>,
 *          Sam Gammon <sam@momentum.io>,
 *          Alex Rosner <alex@momentum.io>,
 *          Ian Weisberger <ian@momentum.io>
 *
 * copyright (c) momentum labs, 2014
 */

goog.require('util.url');
goog.require('util.object');
goog.require('util.struct');
goog.require('support');
goog.require('service');

goog.provide('services.router');

var ROUTES = {
    resolved: [],
    dynamic: [],
    manifest: [],
    named: {}
  },

  ROUTE_HISTORY = {
    back: new util.struct.BiLinkedList(null, 10),
    forward: new util.struct.BiLinkedList(null, 10),
    current: null
  },

  Route, _dispatchRoute;

/**
 * @constructor
 * @param {string} path
 * @param {function(this: ServiceContext, Request)} handler
 */
Route = function (path, handler) {
  var rt = this,
    hasOptional;

  /**
   * @type {string}
   */
  rt.id = path.replace(/\/\{([\w-]+?)\}/g, function (_, routeName) {
    if (!ROUTES.named[routeName])
      throw new Error('Route() couldn\'t resolve route dependency "' + routeName + '"');
    return ROUTES.named[routeName].id;
  });

  /**
   * @type {Array.<string>}
   */
  rt.keys = [];

  /**
   * @type {string}
   */
  rt.path = rt.id
    .replace(/\[(.+?)\]/g, function (_, optional) {
      hasOptional = true;
      return '(?:' + optional + ')?';
    })
    .replace(/\/<(\w+?)>/g, function (_, key) {
      rt.keys.push(key);
      return '\/([^\/\?]+)';
    });

  /**
   * @type {RegExp}
   */
  rt.matcher = new RegExp('^' + rt.path + '$');

  /**
   * @type {function(Object)}
   */
  rt.handler = handler;

  /**
   * @type {boolean}
   */
  rt.resolved = rt.keys.length === 0 && !hasOptional;
};

util.object.mixin(Route, /** @lends {Route.prototype} */{
  /**
   * @param {string} path
   * @param {Request} request
   * @return {Request}
   */
  setArgs: function (path, request) {
    var rt = this;

    path.match(rt.matcher).slice(1).forEach(function (arg, i) {
      request.args[rt.keys[i]] = arg;
    });

    return request;
  }
});

/**
 * @param {string} path
 * @param {Request} request
 * @param {Array.<Route>} _routes
 * @return {*}
 */
_dispatchRoute = function (path, request, _routes) {
  var i = 0,
    route, matched, response;

  while ((route = _routes[i++]) && route.id <= path) {
    if (route.matcher.test(path)) {
      matched = true;
      response = route.handler.call(new ServiceContext(), route.setArgs(path, request));
      break;
    }
  }

  return {
    matched: matched,
    response: response
  };
};

/**
 * @expose
 * @type {Service}
 */
services.router = new Service('router', /** @lends {ServiceContext.prototype.router} */{
  /**
   * Register a handler to listen on a particular slash-delimited string path. Paths can be defined
   * with several types of dynamic components:
   *   - URL args - wrap argument names in '<>', e.g. '/login/<service>'. Args will be evaluated
   *     against the requested path and available at request.args, so the handler for the example
   *     path, when handling '/login/fb', would have 'request.args.service === "fb"'.
   *   - Optional parts - wrap path portions in '[]', e.g. '/login[/<service>]' will match both
   *     '/login' and '/login/fb'.
   *   - Route shortname - prefix path with '<shortname>:', e.g. 'login:/login'. Named routes can
   *     be embedded in other routes via '/{shortname}', e.g. '/{login}/fb' expands to '/login/fb'.
   * @param {string} path
   * @param {function(Object): ?Object} handler
   */
  register: function (path, handler) {
    var name, route, routes, i;

    path = path.split(':');

    if (path.length > 1)
      name = path.shift();

    route = new Route(path.shift(), handler);
    routes = route.resolved ? ROUTES.resolved : ROUTES.dynamic;

    if (name)
      ROUTES.named[name] = route;

    for (i = 0; i < routes.length; i++) {
      if (routes[i].id > route.id) {
        routes.splice(i, 0, route);
        return;
      }
    }

    routes.push(route);
  },

  /**
   * @param {string} path
   * @param {Request=} request
   * @this {ServiceContext}
   */
  route: function (path, request) {
    var matched = false,
      params, param, findRoute, response;

    request = request || {};
    request.args = {};
    request.params = request.params || {};

    params = util.url.parseParams(path);

    for (param in params) {
      if (params.hasOwnProperty(param)) {
        request.params[param] = params[param];
      }
    }

    path = path.split('?')[0];

    this.emit('route', path, request);

    response = _dispatchRoute(path, request, ROUTES.resolved);

    if (!response.matched)
      response = _dispatchRoute(path, request, ROUTES.dynamic);

    if (response.matched) {
      response = response.response;

      if (!(ROUTE_HISTORY.current && ROUTE_HISTORY.current.path === path))
        this.emit('routed', path, request, response);
    } else {
      console.warn('Router could not match route: ' + path);
      this.emit('error', path, request, { status: 404 });
    }

    return response;
  },

  /**
   * @expose
   * @this {ServiceContext}
   */
  back: function () {
    var target = ROUTE_HISTORY.back.rpop();

    if (target) {
      if (ROUTE_HISTORY.current)
        ROUTE_HISTORY.forward.lpush(ROUTE_HISTORY.current);

      ROUTE_HISTORY.current = null;

      this.router.route(target.path, target.request);
    } else {
      this.router.route('/');
    }
  },

  /**
   * @expose
   * @this {ServiceContext}
   */
  forward: function () {
    var target = ROUTE_HISTORY.forward.lpop();

    if (target) {
      this.router.route(target.path, target.request);
    } else {
      this.router.route('/');
    }
  },

  /**
   * @expose
   * @return {Array.<string>}
   */
  manifest: function () {
    var manifest = ROUTES.manifest,
      resolved = ROUTES.resolved,
      dynamic = ROUTES.dynamic,
      resolvedI, dynamicI;

    if (manifest.length === resolved.length + dynamic.length)
      return manifest;

    manifest = [];

    resolvedI = dynamicI = 0;

    while (resolvedI < resolved.length || dynamicI < dynamic.length) {
      if (resolvedI === resolved.length) {
        manifest.push(dynamic[dynamicI++].id);
        continue;
      }

      if (dynamicI === dynamic.length) {
        manifest.push(resolved[resolvedI++].id);
        continue;
      }

      manifest.push(resolved[resolvedI].id <= dynamic[dynamicI].id ?
        resolved[resolvedI++].id : dynamic[dynamicI++].id);
    }

    ROUTES.manifest = manifest;

    return manifest;
  },

  /**
   * @param {Object.<string, function(Object)>} _routes
   * @param {function(string=)=} handleInitial
   * @this {ServiceContext}
   */
  init: function (routes, handleInitial) {
    for (var k in routes) {
      if (routes.hasOwnProperty(k) && typeof routes[k] === 'function')
        this.register(k, routes[k]);
    }

    this.on('routed', function (path, request, response) {
      // @TODO david: handle forward/backward via path compare?
      if (ROUTE_HISTORY.current)
        ROUTE_HISTORY.back.rpush(ROUTE_HISTORY.current);

      response = response || {};

      response.path = path;
      response.request = request;

      ROUTE_HISTORY.current = response;
    });

    if (handleInitial)
      handleInitial(window.location.pathname);
  }

}, true);

/**
 * @expose
 * @param {string} path
 * @throws {TypeError}
 */
Function.prototype.route;

Object.defineProperty(Function.prototype, 'route', {
  /**
   * @expose
   * @param {string} path
   * @throws {TypeError} If route is not a string.
   * @this {Function}
   */
  value: function (route) {
    var fn = this,
      ctx;

    if (typeof route !== 'string')
      throw new TypeError('Function.route() expects a string path.');

    services.router.register(route, function () { return fn.apply(ctx, arguments); });

    return function () {
      ctx = this;
      return fn.apply(this, arguments);
    };
  }
});