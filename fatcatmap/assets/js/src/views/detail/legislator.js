/**
 * @fileoverview Legislator detail view.
 *
 * @author  David Rekow <david@momentum.io>,
 *          Sam Gammon <sam@momentum.io>,
 *          Alex Rosner <alex@momentum.io>,
 *          Ian Weisberger <ian@momentum.io>
 * 
 * copyright (c) momentum labs, 2014
 */

goog.require('View');
goog.require('views.Detail');

goog.provide('views.detail.Legislator');

/**
 * @constructor
 * @extends {View}
 * @param {VueOptions} options
 */
views.detail.Legislator = View.extend({
  /**
   * @expose
   * @type {string}
   */
  viewname: 'detail.legislator',

  /**
   * @expose
   * @type {boolean}
   */
  replace: true,

  /**
   * @expose
   * @type {Object}
   */
  data: {
    /**
     * @expose
     * @type {?string}
     */
    key: null,

    /**
     * @expose
     * @type {?string}
     */
    kind: null,

    /**
     * @expose
     * @type {?string}
     */
    fec_id: '',

    /**
     * @expose
     * @type {?string}
     */
    bioguideid: '',

    /**
     * @expose
     * @type {?string}
     */
    govtrack_id: '',

    /**
     * @expose
     * @type {?string}
     */
    thomas_id: '',

    /**
     * @expose
     * @type {?string}
     */
    osid: '',

    /**
     * @expose
     * @type {?string}
     */
    lismemberid: null,

    /**
     * @expose
     * @type {?string}
     */
    icpsrid: null,

    /**
     * @expose
     * @type {?string}
     */
    fbid: null,

    /**
     * @expose
     * @type {?string}
     */
    twitterid: null,

    /**
     * @expose
     * @type {?string}
     */
    metavidid: null,

    /**
     * @expose
     * @type {?string}
     */
    pvsid: null,

    /**
     * @expose
     * @type {?string}
     */
    firstname: '',

    /**
     * @expose
     * @type {?string}
     */
    lastname: '',

    /**
     * @expose
     * @type {?string}
     */
    gender: '',

    /**
     * @expose
     * @type {?string}
     */
    birthday: '',

    /**
     * @expose
     * @type {?string}
     */
    lastnameenc: '',

    /**
     * @expose
     * @type {?string}
     */
    lastnamealt: null,

    /**
     * @expose
     * @type {?string}
     */
    namemod: null,

    /**
     * @expose
     * @type {?string}
     */
    nickname: null,

    /**
     * @expose
     * @type {?string}
     */
    religion: null

  },

  /**
   * @expose
   * @this {views.detail.Legislator}
   */
  attached: function () {
    var el = this.$el,
      parent = el.parentNode,
      transitionListener = function (e) {
        parent.removeEventListener('transitionend', transitionListener);
        parent.removeEventListener('webkitTransitionEnd', transitionListener);
        el.classList.remove('v-enter');
      };
    
    parent.addEventListener('webkitTransitionEnd', transitionListener);
    parent.addEventListener('transitionend', transitionListener);
    el.classList.add('v-enter');
  }
});