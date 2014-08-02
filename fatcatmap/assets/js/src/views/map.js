/**
 * @fileoverview Map view.
 *
 * @author  David Rekow <david@momentum.io>,
 *          Sam Gammon <sam@momentum.io>,
 *          Alex Rosner <alex@momentum.io>,
 *          Ian Weisberger <ian@momentum.io>
 * 
 * copyright (c) momentum labs, 2014
 */

goog.require('$');
goog.require('supports');
goog.require('View');
goog.require('views.Detail');

goog.provide('views.Map');

/**
 * @constructor
 * @extends {View}
 * @param {VueOptions} options
 */
views.Map = View.extend({
  /**
   * @expose
   * @type {string}
   */
  viewname: 'map',

  /**
   * @expose
   * @type {Object}
   */
  data: {
    /**
     * @expose
     * @type {boolean}
     */
    active: true,

    /**
     * @expose
     * @type {?Object}
     */
    selected: null,

    /**
     * @expose
     * @type {Object}
     */
    config: {
      /**
       * @expose
       * @type {number}
       */
      width: 0,

      /**
       * @expose
       * @type {number}
       */
      height: 0,

      /**
       * @expose
       * @type {Object}
       */
      force: {
        /**
         * @expose
         * @type {number}
         */
        alpha: 0.75,

        /**
         * @expose
         * @type {number}
         */
        strength: 1,

        /**
         * @expose
         * @type {number}
         */
        friction: 0.9,

        /**
         * @expose
         * @type {number}
         */
        theta: 0.7,

        /**
         * @expose
         * @type {number}
         */
        gravity: 0.1,

        /**
         * @expose
         * @type {number}
         */
        charge: -700,

        /**
         * @expose
         * @type {number}
         */
        distance: 180
      },

      /**
       * @expose
       * @type {Object}
       */
      origin: {
        /**
         * @expose
         * @type {boolean}
         */
        snap: true,

        /**
         * @expose
         * @type {boolean}
         */
        dynamic: true,

        /**
         * @expose
         * @type {?Object.<{x: number, y: number}>}
         */
        position: null
      },

      /**
       * @expose
       * @type {Object}
       */
      node: {
        /**
         * @expose
         * @type {number}
         */
        radius: 20,

        /**
         * @expose
         * @type {Array.<string>}
         */
        classes: ['node']
      },

      /**
       * @expose
       * @type {Object}
        */
      labels: {
        /**
         * @expose
         * @type {boolean}
         */
        enable: false,

        /**
         * @expose
         * @type {number}
         */
        distance: 0
      },

      /**
       * @expose
       * @type {Object}
       */
      edge: {
        /**
         * @expose
         * @type {number}
         */
        width: 2,

        /**
         * @expose
         * @type {string}
         */
        stroke: '#999',

        /**
         * @expose
         * @type {Array.<string>}
         */
        classes: ['link']
      },

      /**
       * @expose
       * @type {Object}
       */
      sprite: {
        /**
         * @expose
         * @type {number}
         */
        width: 60,

        /**
         * @expose
         * @type {number}
         */
        height: 60
      }
    }
  },

  /**
   * @expose
   * @type {Object}
   */
  methods: {
    /**
     * @expose
     * @param {MouseEvent} e
     */
    toggleSelected: /** @this {views.Map} */ function (e) {
      
    },

    /**
     * @expose
     * @param {MouseEvent} e
     */
    addSelected: /** @this {views.Map} */ function (e) {

    },

    /**
     * @expose
     * @param {MouseEvent} e
     */
    browseTo: /** @this {views.Map} */ function (e) {

    },

    /**
     * @expose
     * @param {Object=} graph
     */
    draw: function (graph) {

    }
  },

  /**
   * @expose
   * @this {views.Map}
   */
  attached: function () {
    var width = this.$el.offsetWidth,
      height = this.$el.offsetHeight;

    this.$set('config.width', width);
    this.$set('config.height', height);
    this.$set('config.origin.position', {
      x: width - 30,
      y: height - 30
    });
  },

  /**
   * @expose
   * @this {views.Map}
   */
  ready: function () {
    window.addEventListener('resize', function (e) {

    });
  }
});
