/**
 * @fileoverview Base view class.
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

goog.provide('View');

/**
 * @constructor
 * @extends {Vue}
 * @param {VueOptions} options
 */
View = Vue.extend({});

/**
 * @static
 * @override
 * @param {VueOptions} options
 * @return {function(new:Vue, VueOptions)}
 * @throws {Error} When child view name is not passed.
 */
View.extend = function (options) {
  var viewname = options.viewname.toLowerCase(),
    ready = options.ready,
    view;

  if (!viewname || typeof viewname !== 'string')
    throw new Error('View.extend() requires a "viewname" option to be passed.');

  /**
   * @this {View}
   */
  options.ready = function () {
    var view = this;

    if (view.$options.handler)
      view.$on(view.$options.viewname, view.$options.handler.bind(view));

    view.$on('debug', /** @this {View} */function () {
      this.$set('debug', this.debug !== true);
    });

    if (ready)
      ready.call(view);
  };

  view = Vue.extend(options);

  services.view.put(viewname, view);
  Vue.component(viewname, view);

  return view;
};
