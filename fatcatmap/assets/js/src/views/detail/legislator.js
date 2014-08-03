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

goog.require('views.detail');
goog.require('views.AppView');

goog.provide('views.detail.Legislator');

/**
 * @constructor
 * @extends {views.AppView}
 * @param {VueOptions} options
 */
views.detail.Legislator = views.AppView.extend({
  /**
   * @expose
   * @type {string}
   */
  viewname: 'detail.legislator',

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
     * @type {string}
     */
    kind: '',

    /**
     * @expose
     * @type {string}
     */
    class: '',

    /**
     * @expose
     * @type {string}
     */
    firstname: '',

    /**
     * @expose
     * @type {string}
     */
    lastname: '',

    /**
     * @expose
     * @type {string}
     */
    office: '',

    /**
     * @expose
     * @type {?string}
     */
    district: '',

    /**
     * @expose
     * @type {string}
     */
    title: '',

    /**
     * @expose
     * @type {string}
     */
    state: '',

    /**
     * @expose
     * @type {string}
     */
    govtrack_id: '',

    /**
     * @expose
     * @type {string}
     */
    portrait_url: ''
  }
});