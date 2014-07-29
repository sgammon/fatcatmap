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
goog.require('services.template');

goog.provide('views.AppView');

/**
 * @constructor
 * @extends {Vue}
 * @param {VueOptions} options
 */
views.AppView = Vue.extend({});

/**
 * @static
 * @override
 * @param {VueOptions} options
 * @return {function(new:Vue, VueOptions)}
 * @throws {Error} When child view name is not passed.
 */
views.AppView.extend = function (options) {
  var viewname = options.viewname.toLowerCase(),
    view;

  if (!viewname || typeof viewname !== 'string')
    throw new Error('AppView.extend() requires a "viewname" option to be passed.');

  view = Vue.extend(options);

  services.view.put(viewname, view);
  Vue.component(viewname, view);

  return view;
};
