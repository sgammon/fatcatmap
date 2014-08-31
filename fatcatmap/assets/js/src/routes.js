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
   * @this {Client}
   */
  '/': function (request) {
    this.app.$set('page', { active: true });
    this.app.$set('modal', null);

    setTimeout(function () {
      this.app.$.stage.$.map.$set('map.detail', null);
      this.app.$.stage.$.map.$set('map.compare', null);
      this.app.$broadcast('page.map', this.graph.construct());
    }.bind(this), 20);
    return null;
  },

  /**
   * @param {Object} request
   * @return {?Object}
   */
  '/login': function (request) {
    this.app.$set('modal', {
      viewname: 'page.login',
      data: {
        session: null
      }
    });
    this.app.$set('page', null);
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
   * @this {Client}
   */
  '/<key>': function (request) {
    var _this = this,
      key = request.args.key,
      shouldRedraw = !_this.app.page;

    _this.app.$set('page', { active: true });
    _this.app.$set('modal', null);

    setTimeout(function () {
      var map = _this.app.$.stage.$.map,
        prop = map.getComponentNameByKey(key) || 'detail';

      if (prop === 'detail') {
        map.$set('map.compare', null);
        map.$set('map.detail', key);
      } else {
        map.$set('map.detail', null);
        map.$set('map.compare', key);
      }

      _this.app.$broadcast('page.map', shouldRedraw ? _this.graph.construct() : null);

      // _this.data.get(key, {
      //   /**
      //    * @expose
      //    * @param {Object} data
      //    */
      //   success: function (data) {
      //     _this.app.$broadcast(prop, data);
      //   },

      //   /**
      //    * @expose
      //    * @param {Error} e
      //    */
      //   error: function (e) {
      //     request.error = e;
      //     _this.router.route('/404', request);
      //   }
      // });

    }, 20);

    return null;
  },

  /**
   * @param {Object} request
   * @return {?Object}
   */
  '/<key1>/and/<key2>': function (request) {
    var _this = this,
      key1 = request.args.key1,
      key2 = request.args.key2,
      shouldRedraw = !_this.app.page;

    _this.app.$set('page', { active: true });
    _this.app.$set('modal', null);

    setTimeout(function () {
      var map = _this.app.$.stage.$.map,
        prop1 = map.getComponentNameByKey(key1),
        prop2 = map.getComponentNameByKey(key2);

      if (!(prop1 || prop2)) {
        prop1 = 'detail';
        prop2 = 'compare';
      }

      if (!prop1)
        prop1 = prop2 === 'detail' ? 'compare' : 'detail';

      if (!prop2)
        prop2 = prop1 === 'detail' ? 'compare' : 'detail';

      map.$set('map.' + prop1, key1);
      map.$set('map.' + prop2, key2);

      _this.app.$broadcast('page.map', shouldRedraw ? _this.graph.construct() : null);

      // _this.data.get(key1, {
      //   /**
      //    * @expose
      //    * @param {Object} data
      //    */
      //   success: function (data) {
      //     _this.app.$broadcast(prop1, data);
      //   },

      //   /**
      //    * @expose
      //    * @param {Error} e
      //    */
      //   error: function (e) {
      //     request.error = e;
      //     _this.router.route('/404', request);
      //   }
      // });

      // _this.data.get(key2, {
      //   /**
      //    * @expose
      //    * @param {Object} data
      //    */
      //   success: function (data) {
      //     _this.app.$broadcast(prop2, data);
      //   },

      //   /**
      //    * @expose
      //    * @param {Error} e
      //    */
      //   error: function (e) {
      //     request.error = e;
      //     _this.router.route('/404', request);
      //   }
      // });
    }, 20);

    return null;
  }
};
