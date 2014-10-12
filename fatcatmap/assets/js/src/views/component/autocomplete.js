/**
 * @fileoverview Autocompleting-search component.
 *
 * @author  David Rekow <david@momentum.io>,
 *          Sam Gammon <sam@momentum.io>,
 *          Alex Rosner <alex@momentum.io>,
 *          Ian Weisberger <ian@momentum.io>
 * 
 * copyright (c) momentum labs, 2014
 */

goog.require('View');
goog.require('services.search');

goog.provide('views.component.Autocomplete');

/**
 * @constructor
 * @extends {View}
 * @param {VueOptions} options
 */
views.component.Autocomplete = View.extend({
  /**
   * @expose
   * @type {string}
   */
  viewname: 'component.autocomplete',

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
     * @type {string}
     */
    query: '',

    /** 
     * @expose
     * @type {?Array.<SearchResult>}
     */
    results: null
  },

  /**
   * @expose
   * @type {Object}
   */
  methods: /** @lends {views.component.Autocomplete.prototype} */ {
    /**
     * @expose
     * @param {string} term
     */
    query: function (term) {
      var autocomplete = this;

      services.search.autocomplete(term).then(function (response, error) {
        if (error)
          response = { count: 0, results: [] };

        if (response.data)
          response = response.data;

        autocomplete.$set('results', response.results);
      });
    },

    /**
     * @expose
     * @param {MouseEvent} e
     */
    select: function (e) {
      var target = e.target,
        key;

      if (target) {
        key = target.getAttribute('data-result-key');

        if (key) {
          e.preventDefault();
          e.stopPropagation();

          this.$root.$emit('route', '/' + key, { detail: true });
        }
      }
    }
  },

  /**
   * @expose
   * @this {views.component.Autocomplete}
   */
  ready: function () {
    var autocomplete = this;

    this.$watch('query', function (query) {
      if (query.length > 2)
        autocomplete.query(query);
    });
  }
});
