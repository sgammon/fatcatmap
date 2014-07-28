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

goog.provide('view.AppView');

/**
 * @constructor
 * @extends {ViewModel}
 * @param {VueOptions=} options
 */
view.AppView = Vue.extend({});

/**
 * @static
 * @override
 * @param {VueOptions=} options
 * @return {function(new:view.AppView, VueOptions=)}
 * @throws {Error} When child view name is not passed.
 */
view.AppView.extend = function (options) {
  var viewname = options.viewname,
    view;

  if (!viewname || typeof viewname !== 'string')
    throw new Error('AppView.extend() requires a "viewName" to be passed as an option.');

  view = services.view.register(viewname,
    Vue.component(viewname, Vue.extend(options)));

  return view;
};
