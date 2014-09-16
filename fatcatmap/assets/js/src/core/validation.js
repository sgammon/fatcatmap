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
  email: /[\w\-\+\.]+@[a-z0-9\-]+\.[a-z]{2,}(?:\.[a-z]{2, 3})*/
},

validation = {
  /**
   * @expose
   * @param {string} email
   * @return {boolean} If input is valid.
   */
  email: function (email) {
    return VALIDATIONS.email.test(email);
  }
};