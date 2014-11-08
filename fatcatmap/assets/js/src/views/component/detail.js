/**
 * @fileoverview Detail view router component.
 *
 * @author  David Rekow <david@momentum.io>,
 *          Sam Gammon <sam@momentum.io>,
 *          Alex Rosner <alex@momentum.io>,
 *          Ian Weisberger <ian@momentum.io>
 *
 * copyright (c) momentum labs, 2014
 */

goog.require('view');
goog.require('model');

goog.provide('views.component.Detail');

/**
 * @constructor
 * @extends {view.View}
 * @param {VueOptions} options
 */
views.component.Detail = view.View.extend({
  /**
   * @expose
   * @type {string}
   */
  viewname: 'component.detail',

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
     * @type {Object}
     */
    left: {
      /**
       * @expose
       * @type {string}
       */
      view: '',

      /**
       * @expose
       * @type {?Object}
       */
      data: null
    },

    /**
     * @expose
     * @type {Object}
     */
    right: {
      /**
       * @expose
       * @type {string}
       */
      view: '',

      /**
       * @expose
       * @type {?Object}
       */
      data: null
    }
  },

  /**
   * @expose
   * @type {Object.<string, function(...[*])>}
   */
  methods: /** @lends {views.component.Detail.prototype} */{
    /**
     * @expose
     * @param {MouseEvent=} e
     * @this {views.component.Detail}
     */
    close: function (e) {
      var target = e.target,
        parent = target.parentNode,
        key, keys, keyI;

      if (parent.classList.contains('close')) {
        e.preventDefault();
        e.stopPropagation();

        keys = this.keys();
        key = this[parent.parentNode.getAttribute('id').split('_').pop()].data.key;
        
        if (key) {
          keyI = keys.indexOf(key);

          if (keyI > -1) {
            keyI = Math.abs(keyI - 1);
            keys = keys[keyI] ? [keys[keyI]] : [];
          }
        }

        parent.classList.add('transparent');

        this.$parent.setDetail(keys.length ? keys[0] : null);
      }
    },

    /**
     * @expose
     * @return {Array.<?model.Key>}
     * @this {views.component.Detail}
     */
    keys: function () {
      return [
        this.left.data ? this.left.data.key : null,
        this.right.data ? this.right.data.key : null
      ];
    },

    /**
     * @expose
     * @param {?Array.<model.Model>} nodes
     * @this {views.component.Detail}
     */
    select: function (nodes) {
      var left, right;

      nodes = nodes && nodes.length ? nodes : [];
      
      if (nodes.length > 2)
        nodes = nodes.slice(0, 2);

      left = nodes[0];
      right = nodes[1];

      if (left)
        this.$set('left.view', 'detail.' + left.kind.toLowerCase());

      if (right)
        this.$set('right.view', 'detail.' + right.kind.toLowerCase());

      this.$set('left.data', left ? left.toJSON() : null);
      this.$set('right.data', right ? right.toJSON() : null);
    }
  },

  /**
   * @expose
   * @param {Array.<model.Model>} nodes
   * @this {views.component.Detail}
   */
  handler: function (nodes) {
    this.select(nodes); 
  }
});


/**
 * @expose
 * @type {views.component.Detail}
 */
view.View.prototype.$.detail;
