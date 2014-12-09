/**
 * @fileoverview Core view.View class.
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

goog.provide('view');

/**
 * @constructor
 * @extends {Vue}
 * @param {VueOptions} options
 */
view.View = Vue.extend({});

/**
 * @static
 * @override
 * @param {VueOptions} options
 * @return {function(new:Vue, VueOptions)}
 * @throws {Error} When child view name is not passed.
 */
view.View.extend = function (options) {
  var viewname = options.viewname.toLowerCase(),
    events = options.events,
    ready = options.ready,
    view;

  if (!viewname || typeof viewname !== 'string')
    throw new Error('View.extend() requires a "viewname" option to be passed.');

  /**
   * @type {?Array.<string>}
   */
  options.events = events ? Object.keys(events) : null;

  /**
   * @this {view.View}
   */
  options.ready = function () {
    var view = this,
      event;

    if (view.$options.handler)
      view.$on(viewname, view.$options.handler);

    if (view.$options.events)
      view.$options.events.forEach(function (event) {
        if (typeof events[event] === 'function')
          view.$on(viewname + ':' + event, events[event]);
      });

    view.$on('debug', /** @this {view.View} */function () {
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
