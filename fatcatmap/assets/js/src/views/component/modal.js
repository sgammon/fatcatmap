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

goog.require('View');
goog.require('services.router');

goog.provide('views.component.Modal');

/**
 * @constructor
 * @extends {View}
 * @param {VueOptions} options
 */
views.component.Modal = View.extend({
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
View.prototype.$.modal;

/**
 * @expose
 * @type {View}
 */
View.prototype.$.modal.$.content;
