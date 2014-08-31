/**
 * @fileoverview Router for node detail view.
 *
 * @author  David Rekow <david@momentum.io>,
 *          Sam Gammon <sam@momentum.io>,
 *          Alex Rosner <alex@momentum.io>,
 *          Ian Weisberger <ian@momentum.io>
 * 
 * copyright (c) momentum labs, 2014
 */

goog.require('View');
goog.require('services.router');

goog.provide('views.Detail');

/**
 * @constructor
 * @extends {View}
 * @param {VueOptions} options
 */
views.Detail = View.extend({
  /**
   * @expose
   * @type {string}
   */
  viewname: 'detail',

  /**
   * @expose
   * @type {boolean}
   */
  replace: true,

  /**
   * @expose
   * @type {Object.<string, *>}
   */
  data: {
    /**
     * @expose
     * @type {string}
     */
    kind: ''
  },

  /**
   * @expose
   * @type {Object.<string, function(...[*])>}
   */
  methods: {
    /**
     * @expose
     * @param {MouseEvent=} e
     */
    close: function (e) {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }

      services.router.back();
    }
  },

  /**
   * @expose
   * @param {Object} data Data to render into detail view.
   * @this {views.Detail}
   */
  handler: function (data) {
    if (data && data.kind) {
      this.$set('data', data);
      this.$set('kind', 'detail.' + data.kind.toLowerCase());
    }
  }
});

/**
 * @constructor
 * @extends {View}
 * @param {VueOptions} options
 */
views.Compare = View.extend({
  /**
   * @expose
   * @type {string}
   */
  viewname: 'compare',

  /**
   * @expose
   * @type {boolean}
   */
  replace: true,

  /**
   * @expose
   * @type {Object.<string, *>}
   */
  data: {
    /**
     * @expose
     * @type {string}
     */
    kind: ''
  },

  /**
   * @expose
   * @type {Object.<string, function(...[*])>}
   */
  methods: {
    /**
     * @expose
     * @param {MouseEvent=} e
     */
    close: function (e) {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }

      services.router.back();
    }
  },

  /**
   * @expose
   * @param {Object} data Data to render into detail view.
   * @this {views.Compare}
   */
  handler: function (data) {
    if (data && data.kind) {
      this.$set('data', data);
      this.$set('kind', 'detail.' + data.kind.toLowerCase());
    }
  }
});