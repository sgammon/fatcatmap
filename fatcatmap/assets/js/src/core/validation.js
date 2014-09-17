/**
 * @fileoverview Validation utility.
 *
 * @author  David Rekow <david@momentum.io>,
 *          Sam Gammon <sam@momentum.io>,
 *          Alex Rosner <alex@momentum.io>,
 *          Ian Weisberger <ian@momentum.io>
 * 
 * copyright (c) momentum labs, 2014
 */

goog.provide('validation');

var VALIDATIONS = {
  /**
   * @expose
   * @param {string} email
   * @return {boolean} If input is valid.
   */
  email: function (email) {
    return (/[\w\-\+\.]+@[a-z0-9\-]+\.[a-z]{2,}(?:\.[a-z]{2,3})*/).test(email);
  },

  /**
   * @expose
   * @param {(string|number)} num
   * @return {boolean}
   */
  number: function (num) {
    return (typeof num === 'number' || /^\d*$/.test(num));
  },

  /**
   * @expose
   * @param {string} str
   * @return {boolean}
   */
  alpha: function (str) {
    return (/^[a-z]*$/i).test(str);
  },

  /**
   * @expose
   * @param {string} str
   * @return {boolean}
   */
  alphanum: function (str) {
    return (/^[a-z\d]*$/i).test(str);
  },

  /**
   * @expose
   * @param {number} len
   * @param {string} str
   * @return {boolean}
   */
  length: function (len, str) {
    if (!VALIDATIONS.number(len)) {
      console.warn('validation.length requires a length to be passed');
      return true;
    }

    return str.length === +len;
  }
},
  _validations = {},

  /**
   * @param {Event}
   */
  _validateInput = function (e) {
    var input = e.target,
      rules = _validations[input.__validate],
      i;

    if (rules && rules.length) {
      for (i = 0; i < rules.length; i++) {
        if (!rules[i](input.value))
          return input.classList.add('invalid');
      }
    }

    input.classList.add('valid');
  },

  /**
   * @param {Event}
   */
  _removeValidation = function (e) {
    e.target.classList.remove('valid');
    e.target.classList.remove('invalid');
  };

Vue.directive('validate', {
  /**
   * @expose
   * @type {boolean}
   */
  isLiteral: true,

  /**
   * @expose
   * @param {*} value
   */
  bind: function (value) {
    var key = this.arg ? this.arg : this.key,
      arg = this.arg ? this.key : this.arg,
      rule = VALIDATIONS[key],
      rules = _validations[this.el.__validate] || [];

    if (rule) {
      if (arg)
        rule = rule.bind(null, arg);

      rules.push(rule);
    }

    if (!this.el.__validate) {
      /**
       * @expose
       */
      this.el.__validate = this.el.tagName + this.key + Date.now();

      this.el.addEventListener('blur', _validateInput);
      this.el.addEventListener('focus', _removeValidation);
    }

    _validations[this.el.__validate] = rules;
  },

  /**
   * @expose
   * @param {*} value
   */
  unbind: function (value) {
    this.el.removeEventListener('blur', _validateInput);
    this.el.removeEventListener('focus', _removeValidation);

    _validations[this.el.__validate] = null;
  }
});
