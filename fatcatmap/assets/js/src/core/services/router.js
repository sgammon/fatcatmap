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

goog.require('urlutil');
goog.require('supports');
goog.require('services');

goog.provide('services.router');

var ROUTES = {
    resolved: [],
    dynamic: []
  },

  _routeEvents = {
    /** @expose */
    route: [],
    /** @expose */
    routed: [],
    /** @expose */
    error: []
  },

  _findRoute, Route, router;

/**
 * @param {string} path
 * @param {Object} request
 * @param {Array.<Route>} _routes
 * @return {*}
 */
_findRoute = function (path, request, _routes) {
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

      response = route.handler.call(new Client(), request);

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
services.router = /** @lends {Client.prototype.router} */ {
  /**
   * @param {string} path
   * @param {function(Object)} handler
   */
  register: function (path, handler) {
    var inserted = false,
      route, _route, _routes, i;

    route = new Route(path, handler);
    _routes = route.resolved ? ROUTES.resolved : ROUTES.dynamic;

    if (!_routes.length) {
      _routes.push(route);
      return;
    }

    for (i = 0; i < _routes.length; i++) {
      _route = _routes[i];
      if (_route.id < route.id)
        continue;

      _routes.splice(i, 0, route);
      inserted = true;
      break;
    }

    if (inserted === false)
      _routes.push(route);
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

    params = urlutil.parseParams(path);

    for (param in params) {
      if (params.hasOwnProperty(param)) {
        request.params[param] = params[param];
      }
    }

    _routeEvents.route.forEach(function (fn) {
      fn(path, request);
    });

    response = _findRoute(path, request, ROUTES.resolved);

    if (response.matched) {
      response = response.response;

      _routeEvents.routed.forEach(function (fn) {
        fn(path, request, response)
      });

      return response;
    }

    response = _findRoute(path, request, ROUTES.dynamic);

    if (response.matched) {
      response = response.response;

      _routeEvents.routed.forEach(function (fn) {
        fn(path, request, response)
      });

      return response;
    }

    response = {
      status: 404
    };

    _routeEvents.error.forEach(function (fn) {
      fn(path, request, response);
    });

    return response;
  },

  /**
   * @param {string} event
   * @param {function(string, Object=, Object=)} callback
   */
  on: function (event, callback) {
    if (!_routeEvents[event])
      _routeEvents[event] = [];

    _routeEvents[event].push(callback);
  },

  /**
   * @param {string} event
   * @param {function (string, Object=, Object=)=} callback
   */
  off: function (event, callback) {
    var i;
    if (!callback) {
      _routeEvents[event] = [];
    } else {
      i = _routeEvents[event].indexOf(callback);
      if (i > -1)
        _routeEvents[event].splice(i, 1);
    }
  },

  /**
   * @param {Object.<string, function(Object)>} _routes
   * @param {function(string=)=} handleInitial
   * @this {Client}
   */
  init: function (_routes, handleInitial) {
    for (var k in _routes) {
      if (_routes.hasOwnProperty(k) && typeof _routes[k] === 'function') {
        this.router.register(k, _routes[k]);
      }
    }

    if (handleInitial) {
      handleInitial(window.location.pathname.split('?').shift());
    }
  }

}.service('router');
