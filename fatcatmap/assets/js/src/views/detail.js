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
     * @type {?Object}
     */
    left: null,

    /**
     * @expose
     * @type {?Object}
     */
    right: null,

    /**
     * @expose
     * @type {string}
     */
    leftview: '',

    /**
     * @expose
     * @type {string}
     */
    rightview: ''
  },

  /**
   * @expose
   * @type {Object.<string, function(...[*])>}
   */
  methods: {
    /**
     * @expose
     * @param {MouseEvent=} e
     * @this {views.Detail}
     */
    close: function (e) {
      var target = e.target,
        parent = target.parentNode,
        key, keys, keyI;

      
      if (parent.classList.contains('close')) {
        e.preventDefault();
        e.stopPropagation();

        key = this[parent.parentNode.getAttribute('id').split('_').pop()].key;
        keys = this.keys();
        keyI = keys.indexOf(key);

        if (keyI > -1) {
          keyI = Math.abs(keyI - 1);
          keys = keys[keyI] ? [keys[keyI]] : [];
        }

        parent.classList.add('transparent');

        this.$root.$emit('route', '/detail/' +
          (keys.length > 1 ? keys.join('/and/') : keys[0] || ''));
      }
    },

    /**
     * @expose
     * @return {Array.<string>}
     * @this {views.Detail}
     */
    keys: function () {
      var keys = [];

      if (this.left)
        keys.push(this.left.key);

      if (this.right)
        keys.push(this.right.key);

      return keys;
    },

    /**
     * @expose
     * @param {?Array.<Object>} nodes
     * @this {views.Detail}
     */
    select: function (nodes) {
      var detail = this,
        left, right, keys;

      if (nodes && nodes.length) {
        if (nodes.length > 2)
          nodes = nodes.slice(0, 2);

        nodes.forEach(function (node) {
          if (detail.left && detail.left.key === node.key) {
            left = node;
          } else if (detail.right && detail.right.key === node.key) {
            right = node;
          } else {
            if (left) {
              right = node;
            } else {
              left = node;
            }
          }
        });
      }

      keys = [];

      if (left) {
        detail.$set('leftview', 'detail.' + left.kind.toLowerCase());
        keys.push(left.key);
      }

      if (right) {
        detail.$set('rightview', 'detail.' + right.kind.toLowerCase());
        keys.push(right.key);
      }

      detail.$set('left', left);
      detail.$set('right', right);

      detail.$parent.$set('map.selected', keys);
      detail.$parent.$set('map.changed', true);
    }
  },

  /**
   * @expose
   * @param {Array.<Object>} nodes
   * @this {views.Detail}
   */
  handler: function (nodes) {
    this.select(nodes); 
  }
});
