/**
 * @fileoverview Base view(manager) class.
 *
 * @author  David Rekow <david@momentum.io>,
 *          Sam Gammon <sam@momentum.io>,
 *          Alex Rosner <alex@momentum.io>,
 *          Ian Weisberger <ian@momentum.io>
 * 
 * copyright (c) momentum labs, 2014
 */

goog.require('services.view');

goog.provide('views.AppView');

/**
 * @constructor
 * @extends {ViewModel}
 * @param {VueOptions=} options
 */
views.AppView = Vue.extend({});

/**
 * @static
 * @override
 * @param {VueOptions=} options
 * @return {function(new:views.AppView, VueOptions=)}
 * @throws {Error} When child view name is not passed.
 */
views.AppView.extend = function (options) {
  var viewname = options.viewname,
    view;

  if (!viewname || typeof viewname !== 'string')
    throw new Error('AppView.extend() requires a "viewname" option to be passed.');

  view = services.view.register(viewname,
    Vue.component(viewname, Vue.extend(options)));

  return view;
};
