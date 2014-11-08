/**
 * @fileoverview Contributor detail view.
 *
 * @author  David Rekow <david@momentum.io>,
 *          Sam Gammon <sam@momentum.io>,
 *          Alex Rosner <alex@momentum.io>,
 *          Ian Weisberger <ian@momentum.io>
 *
 * copyright (c) momentum labs, 2014
 */

goog.require('view');
goog.require('views.component.Detail');

goog.provide('views.detail.Contributor');

/**
 * @constructor
 * @extends {view.View}
 * @param {VueOptions} options
 */
views.detail.Contributor = view.View.extend({
  /**
   * @expose
   * @type {string}
   */
  viewname: 'detail.contributor',

  /**
   * @expose
   * @type {boolean}
   */
  replace: true,

  /**
   * @expose
   * @this {views.detail.Contributor}
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
