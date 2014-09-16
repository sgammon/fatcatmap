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
goog.require('async');
goog.require('validation');
goog.require('View');

goog.provide('views.page.Login');

/**
 * @constructor
 * @extends {View}
 * @param {VueOptions} options
 */
views.page.Login = View.extend({
  /**
   * @expose
   * @type {string}
   */
  viewname: 'page.login',

  /**
   * @expose
   * @type {boolean}
   */
  replace: true,

  /**
   * @expose
   * @type {Object.<string, function(...[*])>}
   */
  methods: {
    /**
     * @expose
     * @param {MouseEvent} e
     * @this {views.page.Login}
     */
    login: function (e) {
      e.preventDefault();
      e.stopPropagation();
      console.log('Login.login() called.');
    },

    /**
     * @expose
     * @param {MouseEvent} e
     * @this {views.page.Login}
     */
    signup: function (e) {
      e.preventDefault();
      e.stopPropagation();
      console.log('Login.signup() called.');
    },

    /**
     * @expose
     * @param {Event} e
     */
    validate: function (e) {
      var input = e.target,
        rule = validation[input.type];

      if (input.hasAttribute('data-validate'))
        rule = validation[input.getAttribute('data-validate')];

      if (rule)
        input.classList.add(rule(input.value) ? 'valid' : 'invalid');
    },

    /**
     * @expose
     * param {Event} e
     */
    clearValidation: function (e) {
      var input = e.target;

      input.classList.remove('valid');
      input.classList.remove('invalid');
    }
  },

  /**
   * @expose
   * @type {Object.<string, *>}
   */
  data: {
    /**
     * @expose
     * @type {?string}
     */
    session: null
  },

  /**
   * @expose
   * @this {views.page.Login}
   */
  ready: function () {
    var _this = this;

    _this.validate = _this.validate.bind(_this);
    _this.clearValidation = _this.clearValidation.bind(_this);

    $('input', _this.$el).forEach(function (input) {
      input.addEventListener('blur', _this.validate);
      input.addEventListener('focus', _this.clearValidation);
    });
  },

  /**
   * @expose
   * @this {views.page.Login}
   */
  beforeDestroy: function () {
    var _this = this;

    $('input', _this.$el).forEach(function (input) {
      input.removeEventListener('blur', _this.validate);
      input.removeEventListener('focus', _this.clearValidation);
    })
  }
});
