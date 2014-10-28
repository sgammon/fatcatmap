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
   * @type {{active: boolean}}
   */
  'page.active': true,

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
    var graph = this.services.graph,
      state = request.state || _DEFAULT_STATE;

    this.app.setState(state);

    this.app.nextTick(/** @this {views.App} */function () {
      if (graph.active) {
        this.$broadcast('page.map', graph.active);
        this.$broadcast('page.map:origin')
      } else {
        graph.construct().then(function (graph, err) {
          if (err)
            return this.error(err);
          
          this.$broadcast('page.map', graph);
        });
      }

      this.$broadcast('component.detail');
    });

    return state;
  },

  /**
   * @param {Request} request
   * @return {?Object}
   * @this {ServiceContext}
   */
  '/login': function (request) {
    var state = request.state || {
      'page': null,
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
  'origin:/<kind>/<id>[/and/<kind2>/<id2>]': function (request) {
    var app = this.app,
      kind = request.args.kind,
      key = new model.Key(kind.charAt(0).toUpperCase() + kind.slice(1), request.args.id),
      state = request.state || _DEFAULT_STATE;

    app.setState(state);

    this.services.graph.construct(key, null, !this.services.graph.active.nodes.has(key))
      .then(function (graph, err) {
        if (err)
          return app.error(err);

        app.$broadcast('page.map', graph);
        app.$broadcast('page.map:origin', key);
      });
    
    return state;
  },

  /**
   * Displays a graph at origin(s), with origin(s) shown in detail.
   * @param {Request} request
   * @return {?Object}
   */
  'detail:/{origin}/detail': function (request) {
    var app = this.app,
      kind = request.args.kind,
      key = new model.Key(kind.charAt(0).toUpperCase() + kind.slice(1), request.args.id),
      state = request.state || _DEFAULT_STATE;

    app.setState(state);

    this.services.graph.construct(key, null, !this.services.graph.active.nodes.has(key))
      .then(function (graph, err) {
        if (err)
          return app.error(err);

        app.$broadcast('page.map', graph);
        app.$broadcast('page.map:origin', key);
      });

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
   * @param {Request} 
   * @return {?Object}
   */
  '/{detail}/<kind3>/<id3>[/and/<kind4>/<id4>]': function (request) {
    var app = this.app,
      kind = request.args.kind,
      key = new model.Key(kind.charAt(0).toUpperCase() + kind.slice(1), request.args.id),
      state = request.state || _DEFAULT_STATE,
      details = [];

    app.setState(state);

    kind = request.args['kind3'];
    details.push(new model.Key(kind.charAt(0).toUpperCase() + kind.slice(1), request.args['id3']));

    kind = request.args['kind4'];
    if (kind)
      details.push(
        new model.Key(kind.charAt(0).toUpperCase() + kind.slice(1), request.args['id4']));

    this.services.graph.construct(key, null, !this.services.graph.active.nodes.has(key))
      .then(function (graph, err) {
        if (err)
          return app.error(err);

        app.$broadcast('page.map', graph);
        app.$broadcast('page.map:origin', key);
      });

    this.services.data.getAll(details)
      .then(function (data, err) {
        if (err)
          return app.error(err);

        app.$broadcast('component.detail', [data]);
      });

    return state;
  }
};
