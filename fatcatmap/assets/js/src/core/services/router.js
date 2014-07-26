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

goog.require('supports');
goog.require('services');

goog.provide('services.router');

var keyMatcher = /\/<(\w+)>/,

  routes = {
    resolved: [],
    dynamic: []
  },

  queues = {
    route: [],
    routed: [],
    error: []
  },

  Route, router;

/**
 * @constructor
 * @param {string} path
 * @param {function} handler
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
  rt.id = path.replace(keyMatcher, function (_, leading, key) {
    rt.keys.push(key);
    return '/(\\w+)';
  });

  /**
   * @type {RegExp}
   */
  rt.matcher = new RegExp(rt.id);

  /**
   * @type {function}
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
router = {
  /**
   * @expose
   * @param {string|Object.<string, function>} path
   * @param {function=} handler
   */
  register: function (path, handler) {
    var inserted = false,
      route, _route, _routes, i;

    if (!handler && typeof path === 'object') {
      for (var k in path) {
        this.router.register(k, path[k]);
      }
      return;
    }

    route = new Route(path, handler);
    _routes = route.resolved ? routes.resolved : routes.dynamic;

    if (!_routes.length) {
      _routes.push(route);
      return;
    }

    for (i = 0; i < _routes.length; i++) {
      _route = _routes[i];
      if (_route.id < route.id) {
        continue;
      }
      _routes.splice(i, 0, route);
      inserted = true;
      break;
    }

    if (inserted === false) {
      _routes.push(route);
    }
  },

  /**
   * @expose
   * @param {string} path
   * @param {Object=} request
   */
  route: function (path, request) {
    var matched = false,
      findRoute, _routes, response;

    request = request || {};
    request.params = request.params || {};

    queues.route.forEach(function (fn) {
      fn(path, request);
    });

    findRoute = function () {
      var i = 0,
        setParam = function (key, i) {
          request.params[route.keys[i]] = key;
        },
        triggerRouted = function (fn) {
          fn(path, request, response);
        },
        route, match, response;
      while ((route = _routes[i++]) && route.id < path) {
        if (route.matcher.test(path)) {
          matched = true;

          match = path.match(route.matcher).slice(1);
          match.forEach(setParam);

          response = route.handler(request);

          queues.routed.forEach(triggerRouted);

          if (response.status === 404) {
            response.path = path;
            return this.router.route('/404', response);
          }

          return response;
        }
      }
    };

    _routes = routes.resolved;
    response = findRoute();

    if (matched) {
      return response;
    }

    _routes = routes.dynamic;
    response = findRoute();

    if (matched) {
      return response;
    }

    response = {
      status: 404
    };

    queues.error.forEach(function (fn) {
      fn(path, request, response);
    });

    return response;
  },

  /**
   * @expose
   * @param {string} event
   * @param {function(string, Object=, Object=)} callback
   */
  on: function (event, callback) {
    if (!queues[event]) {
      queues[event] = [];
    }
    queues[event].push(callback);
  },

  /**
   * @expose
   * @param {string} event
   * @param {function (string, Object=, Object=)=} callback
   */
  off: function (event, callback) {
    var i;
    if (!callback) {
      queues[event] = [];
    } else {
      i = queues[event].indexOf(callback);
      if (i > -1) {
        queues[event].splice(i, 1);
      }
    }
  }

}.service('router');
