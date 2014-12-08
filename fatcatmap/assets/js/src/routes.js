/*jshint sub:true */
/**
 * @fileoverview Catnip route handlers. Updates history and view state, via service if necessary.
 *
 * @author  David Rekow <david@momentum.io>,
 *          Sam Gammon <sam@momentum.io>,
 *          Alex Rosner <alex@momentum.io>,
 *          Ian Weisberger <ian@momentum.io>
 *
 * copyright (c) momentum labs, 2014
 */

goog.require('model');
goog.require('services.data');
goog.require('services.graph');
goog.require('views.App');

goog.provide('routes');

var _DEFAULT_STATE, routes;

_DEFAULT_STATE = {
  /**
   * @type {boolean}
   */
  'page.active': true,

  /**
   * @type {boolean}
   */
  'page.search': true,

  /**
   * @type {boolean}
   */
  'page.name': 'page.map',

  /**
   * @type {?Object.<{
   *   viewname: string,
   *   data: Object.<{session: ?string}>
   * }>}
   */
  'modal': null
};

routes = {
  /**
   * @param {Request} request
   * @return {?Object}
   * @this {ServiceContext}
   */
  '/': function (request) {
    var app = this.app,
      graph = this.services.graph,
      state = request.state || _DEFAULT_STATE;

    if (graph.active) {
      app.nextTick(function () {
        graph.router.route('/' + graph.active.origin.key, request);
      });
      return state;
    }

    app.setState(state);

    graph.construct().then(function (graph, err) {
      if (err)
        return app.error(err);
      
      graph.router.route('/' + graph.active.origin.key, request);
    });

    app.$broadcast('component.detail');

    return state;
  },

  /**
   * @param {Request} request
   * @return {?Object}
   * @this {ServiceContext}
   */
  '/login': function (request) {
    var state = {
      'page.active': false,
      'page.search': false,
      'modal.viewname': 'page.login',
      'modal.data.session': null
    };

    this.app.setState(state);

    if (this.app.$.stage)
      this.app.$.stage.$.map.active = false;

    return state;
  },

  /**
   * @param {Request} request
   * @return {?Object}
   * @this {ServiceContext}
   */
  '/search': function (request) {
    var state = request.state || {};
    state['page.search'] = false;
    state['page.active'] = false;

    this.app.setState(state);

    if (this.app.$.stage)
      this.app.$.stage.$.map.active = false;

    return state;
  },

  /**
   * @param {Request} request
   * @return {?Object}
   */
  '/404': function (request) {
    console.warn('404 :(');
    console.warn(request);
  },

  /**
   * Displays a graph with origin(s) specified by kind and ID (e.g. '/person/123').
   * For now, we assume one origin.
   * @param {Request} request
   * @return {?Object}
   * @this {ServiceContext}
   */
  'origin:/<key>[/and/<key2>]': function (request) {
    var app = this.app,
      key = model.Key.inflate(request.args['key']),
      state = request.state || _DEFAULT_STATE;

    app.setState(state);

    if (!key.equals(this.services.graph.active.origin.key)) {
      this.services.graph.construct(key, null, !this.services.graph.active.nodes.has(key))
        .then(function (graph, err) {
          if (err)
            return app.error(err);

          app.$broadcast('page.map', graph);
          app.$broadcast('page.map:origin', key);
        });
    } else {
      if (!(app.$.stage && app.$.stage.$.map.active))
        app.$broadcast('page.map', this.services.graph.active);
    }

    app.$broadcast('component.detail');
    
    return state;
  },

  /**
   * Displays a graph at origin(s), with origin(s) shown in detail.
   * @param {Request} request
   * @return {?Object}
   * @this {ServiceContext}
   */
  'detail:/{origin}/detail': function (request) {
    var app = this.app,
      key = model.Key.inflate(request.args['key']),
      state = request.state || _DEFAULT_STATE;

    app.setState(state);

    if (!key.equals(this.services.graph.active.origin.key)) {
      this.services.graph.construct(key, null, !this.services.graph.active.nodes.has(key))
        .then(function (graph, err) {
          if (err)
            return app.error(err);

          app.$broadcast('page.map', graph);
          app.$broadcast('page.map:origin', key);
        });
    } else {
      if (!(app.$.stage && app.$.stage.$.map.active))
        app.$broadcast('page.map', this.services.graph.active);
    }

    this.services.data.get(key)
      .then(function (data, err) {
        if (err)
          return app.error(err);

        app.$broadcast('component.detail', [data]);
      });
    
    return state;
  },

  /**
   * Displays a graph at origin(s), with additional key(s) shown in detail.
   * @param {Request} request
   * @return {?Object}
   * @this {ServiceContext}
   */
  '/{detail}/<key3>[/and/<key4>]': function (request) {
    var app = this.app,
      key = model.Key.inflate(request.args['key']),
      state = request.state || _DEFAULT_STATE,
      details = [];

    app.setState(state);

    details.push(model.Key.inflate(request.args['key3']));

    if (request.args['key4'])
      details.push(model.Key.inflate(request.args['key4']));

    if (!key.equals(this.services.graph.active.origin.key)) {
      this.services.graph.construct(key, null, !this.services.graph.active.nodes.has(key))
        .then(function (graph, err) {
          if (err)
            return app.error(err);

          app.$broadcast('page.map', graph);
          app.$broadcast('page.map:origin', key);
        });
    } else {
      if (!(app.$.stage && app.$.stage.$.map.active))
        app.$broadcast('page.map', this.services.graph.active);
    }

    this.services.data.getAll(details)
      .then(function (data, err) {
        if (err)
          return app.error(err);

        app.$broadcast('component.detail', data);
      });

    return state;
  }
};
