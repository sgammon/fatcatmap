/**
 * @fileoverview Core application namespace.
 *
 * @author  David Rekow <david@momentum.io>,
 *          Sam Gammon <sam@momentum.io>,
 *          Alex Rosner <alex@momentum.io>,
 *          Ian Weisberger <ian@momentum.io>
 * 
 * copyright (c) momentum labs, 2014
 */

goog.require('supports');
goog.require('service');
goog.require('mapper');
goog.require('graph');

goog.provide('catnip');

/**
 * @this {Client}
 */
var catnip = function () {
  this.graph();
  return {};
}.client();
