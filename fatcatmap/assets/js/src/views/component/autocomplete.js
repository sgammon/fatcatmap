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
  replace: false,

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
  NO_RESULTS: /** @lends {views.component.Autocomplete.prototype.$options.NO_RESULTS} */{
    /**
     * @expose
     * @type {string}
     */
    label: '',

    /**
     * @expose
     * @type {Object}
     */
    result: {
      /**
       * @expose
       * @type {string}
       */
      id: '',

      /**
       * @expose
       * @type {string}
       */
      kind: '',

      /**
       * @expose
       * @type {string}
       */
      encoded: ''
    }
  },

  /**
   * @expose
   * @type {Object}
   */
  methods: /** @lends {views.component.Autocomplete.prototype} */ {
    /**
     * @expose
     */
    clear: function () {
      this.previous = this.results;
      this.$set('results', []);
    },

    /**
     * @expose
     */
    restore: function () {
      this.$set('results', this.previous || []);
    },

    /**
     * @expose
     * @param {MouseEvent} e
     */
    pin: function (e) {
      this.pinned = true;
    },

    /**
     * @expose
     * @param {MouseEvent} e
     */
    unpin: function (e) {
      this.pinned = false;

      if (this.blurred === true)
        this.blur();
    },

    /**
     * @expose
     * @param {InputEvent=} e
     */
    blur: function (e) {
      var autocomplete = this;

      if (this.pinned === true) {
        this.blurred = true;
      } else {
        this.blurred = false;
        Vue.nextTick(function () {
          autocomplete.input.classList.remove('focused');
          autocomplete.clear();
        });
      }
    },

    /**
     * @expose
     * @param {InputEvent=} e
     */
    focus: function (e) {
      var autocomplete = this;

      Vue.nextTick(function () {
        autocomplete.input.classList.add('focused');
        autocomplete.restore();
      });
    },

    /**
     * @expose
     * @param {string} term
     */
    submit: function (term) {
      var autocomplete = this;

      services.search.autocomplete(term).then(function (results, error) {
        if (error || !results.length)
          results = [autocomplete.$options.NO_RESULTS];

        autocomplete.$set('results', results);
      });
    }
  },

  /**
   * @expose
   * @this {views.componet.Autocomplete}
   */
  beforeDestroy: function () {
    this.input.removeEventListener('blur', this.blur);
    this.input.removeEventListener('focus', this.focus)
  },

  /**
   * @expose
   * @this {views.component.Autocomplete}
   */
  ready: function () {
    var autocomplete = this;

    autocomplete.input = autocomplete.$el.querySelector('input');

    autocomplete.blur = autocomplete.blur.bind(autocomplete);
    autocomplete.focus = autocomplete.focus.bind(autocomplete);

    autocomplete.input.addEventListener('blur', autocomplete.blur);
    autocomplete.input.addEventListener('focus', autocomplete.focus);

    autocomplete.$watch('query', function (query) {
      if (query.length > 2) {
        autocomplete.submit(query);
      } else {
        autocomplete.clear();
      }
    });

    autocomplete.pinned = false;
  }
});

/**
 * @expose
 * @type {views.component.Autocomplete}
 */
View.prototype.$.autocomplete;
