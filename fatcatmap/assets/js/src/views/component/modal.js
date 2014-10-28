/**
 * @fileoverview Modal component view.
 *
 * @author  David Rekow <david@momentum.io>,
 *          Sam Gammon <sam@momentum.io>,
 *          Alex Rosner <alex@momentum.io>,
 *          Ian Weisberger <ian@momentum.io>
 *
 * copyright (c) momentum labs, 2014
 */

goog.require('view');
goog.require('services.router');

goog.provide('views.component.Modal');

/**
 * @constructor
 * @extends {view.View}
 * @param {VueOptions} options
 */
views.component.Modal = view.View.extend({
  /**
   * @expose
   * @type {string}
   */
  viewname: 'component.modal',

  /**
   * @expose
   * @type {boolean}
   */
  replace: true,

  /**
   * @expose
   * @type {Object}
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
  }
});

/**
 * @expose
 * @type {views.component.Modal}
 */
view.View.prototype.$.modal;

/**
 * @expose
 * @type {view.View}
 */
view.View.prototype.$.modal.$.content;
