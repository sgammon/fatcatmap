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

goog.require('$');
goog.require('routes');
goog.require('supports');
goog.require('services');
goog.require('services.router');
goog.require('services.history');
goog.require('services.graph');
goog.require('services.map');

goog.provide('catnip');

/**
 * @this {service}
 */
var catnip = function () {
  var context = this.context = JSON.parse($('#js-context').textContent);

  if (context['services']) {
    this.rpc.init(context['services']);
  }

  if (context['session'] && context['session']['established']) {
    this.session = context['session']['payload'];
  } else {
    this.session = {};
  }

  this.router.register(ROUTES);
  this.history.start();

  return this;
}.client();
