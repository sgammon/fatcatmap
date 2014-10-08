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
goog.require('util.struct');
goog.require('support');
goog.require('service');

goog.provide('services.router');

var ROUTES = {
    resolved: [],
    dynamic: []
  },

  ROUTE_HISTORY = {
    back: new util.struct.BiLinkedList(null, 10),
    forward: new util.struct.BiLinkedList(null, 10),
    current: null
  },

  _dispatchRoute, Route, router;

/**
 * @param {string} path
 * @param {Object} request
 * @param {Array.<Route>} _routes
 * @return {*}
 */
_dispatchRoute = function (path, request, _routes) {
  var i = 0,
    route, matched, match, response,
    /**
     * @param {string} key
     * @param {number} i
     */
    setArg = function (key, i) {
      request.args[route.keys[i]] = key;
    };

  while ((route = _routes[i++]) && route.id <= path) {
    if (route.matcher.test(path)) {
      matched = true;

      match = path.match(route.matcher).slice(1);
      match.forEach(setArg);

      response = route.handler.call(new ServiceContext(), request);
      break;
    }
  }

  return {
    matched: matched,
    response: response
  };
};

/**
 * @constructor
 * @param {string} path
 * @param {function(Object)} handler
 */
Route = function (path, handler) {
  var rt = this;

  /**
   * @type {Array.<string>}
   */
  rt.keys = [];

  /**
   * @type {string}
   */
  rt.id = path.replace(/\/<(\w+)>/g, function (_, key) {
    rt.keys.push(key);
    return '/(\\w+)';
  });

  /**
   * @type {RegExp}
   */
  rt.matcher = new RegExp('^' + rt.id + '$');

  /**
   * @type {function(Object)}
   */
  rt.handler = handler;

  /**
   * @type {boolean}
   */
  rt.resolved = rt.keys.length === 0;
};

/**
 * @expose
 */
services.router = /** @lends {ServiceContext.prototype.router} */ {
  /**
   * @param {string} path
   * @param {function(Object)} handler
   */
  register: function (path, handler) {
    var route, routes, i;

    route = new Route(path, handler);
    routes = route.resolved ? ROUTES.resolved : ROUTES.dynamic;

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
   * @param {Object=} request
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

    this.emit('route', path, request);

    response = _dispatchRoute(path, request, ROUTES.resolved);

    if (!response.matched)
      response = _dispatchRoute(path, request, ROUTES.dynamic);

    if (response.matched) {
      response = response.response;

      if (!(ROUTE_HISTORY.current && ROUTE_HISTORY.current.path === path))
        this.emit('routed', path, request, response);
    } else {
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
   * @param {Object.<string, function(Object)>} _routes
   * @param {function(string=)=} handleInitial
   * @this {ServiceContext}
   */
  init: function (routes, handleInitial) {
    for (var k in routes) {
      if (routes.hasOwnProperty(k) && typeof routes[k] === 'function')
        this.router.register(k, routes[k]);
    }

    this.router.on('routed', function (path, request, response) {
      // @TODO david: handle forward/backward via path compare?
      if (ROUTE_HISTORY.current)
        ROUTE_HISTORY.back.rpush(ROUTE_HISTORY.current);

      response.path = path;
      response.request = request;

      ROUTE_HISTORY.current = response;
    });

    if (handleInitial)
      handleInitial(window.location.pathname);
  }

}.service('router');
