/**
 * @fileoverview Catnip route declarations.
 *
 * @author  David Rekow <david@momentum.io>,
 *          Sam Gammon <sam@momentum.io>,
 *          Alex Rosner <alex@momentum.io>,
 *          Ian Weisberger <ian@momentum.io>
 * 
 * copyright (c) momentum labs, 2014
 */

goog.require('async');

goog.provide('routes');

var routes = {
  /**
   * @param {Object} request
   * @return {?Object}
   * @this {ServiceContext}
   */
  '/': function (request) {
    var state = request.state || {},
      app = this.app,
      graph = (!app.$.stage || !app.$.stage.$.map.active) ?
        this.graph.construct() : null;

    state.page = state.page || { active: true };
    state.modal = state.modal || null;

    app.$set('page', state.page);
    app.$set('modal', state.modal);

    app.nextTick(function () {
      app.$broadcast('page.map', graph);
      app.$broadcast('detail');
    });

    return state;
  },

  /**
   * @param {Object} request
   * @return {?Object}
   * @this {ServiceContext}
   */
  '/login': function (request) {
    var state = request.state || {};

    state.page = null;
    state.modal = state.modal || {
      viewname: 'page.login',
      data: {
        session: this.catnip.session
      }
    };

    this.app.$set('modal', state.modal);
    this.app.$set('page', state.page);

    if (this.app.$.stage)
      this.app.$.stage.$.map.active = false;

    return state;
  },

  /**
   * @param {Object} request
   * @return {?Object}
   */
  '/settings': function (request) {

  },

  /**
   * @param {Object} request
   * @return {?Object}
   */
  '/404': function (request) {

  },

  /**
   * @param {Object} request
   * @return {?Object}
   * @this {ServiceContext}
   */
  '/<key>': function (request) {
    var data = this.data,
      app = this.app,
      state = request.state || {},
      graph = (!app.$.stage || !app.$.stage.$.map.active) ?
        this.graph.construct() : null;

    state.page = state.page || { active: true };
    state.modal = state.modal || null;

    app.$set('page', state.page);
    app.$set('modal', state.modal);

    app.nextTick(function () {
      app.$broadcast('page.map', graph);

      data.get(request.args.key, /** @type {CallbackMap} */({
        success: function (data) {
          app.$broadcast('detail', [data]);
        },

        error: function (e) {
          app.$emit('route', '/404', {
            error: e
          });
        }
      }));
    });

    return state;
  },

  /**
   * @param {Object} request
   * @return {?Object}
   * @this {ServiceContext}
   */
  '/<key1>/and/<key2>': function (request) {
    var data = this.data,
      app = this.app,
      key1 = request.args.key1,
      key2 = request.args.key2,
      state = request.state || {},
      graph = (!app.$.stage || !app.$.stage.$.map.active) ?
        this.graph.construct() : null;

    state.page = state.page || { active: true };
    state.modal = state.modal || null;

    app.$set('page', state.page);
    app.$set('modal', state.modal);

    app.nextTick(function () {
      app.$broadcast('page.map', graph);

      data.getAll([key1, key2], /** @type {CallbackMap} */({
        success: function (data) {
          app.$broadcast('detail', data);
        },

        error: function (e) {
          app.$emit('route', '/404', {
            error: e
          });
        }
      }));
    });

    return state;
  }
};
