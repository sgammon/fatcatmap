/**
 * @fileoverview Fatcatmap view service.
 *
 * @author  David Rekow <david@momentum.io>,
 *          Sam Gammon <sam@momentum.io>,
 *          Alex Rosner <alex@momentum.io>,
 *          Ian Weisberger <ian@momentum.io>
 * 
 * copyright (c) momentum labs, 2014
 */

goog.require('async');
goog.require('services');
goog.require('services.template');

goog.provide('services.view');

var VIEWS = {},

  getSelfAndChildren = function (viewname, cb) {
    var filename = viewname.replace('.', '/') + '.html';

    services.template.get(filename, {
      success: function (resp) {
        var children = [],
          source, count;

        if (typeof resp.data !== 'string')
          return cb(false, resp);

        source = resp.data.replace(/v-component=("|')([\w\.\-]+)\1/g, function (_, __, childname) {
          children.push(childname);
          return _;
        });

        count = children.length;

        if (VIEWS[viewname])
          VIEWS[viewname].options.template = source;

        services.template.put(filename, source);

        if (count === 0)
          return cb();

        children.forEach(function (childname) {
          getSelfAndChildren(childname, function () {
            count -= 1;
            if (count === 0)
              cb(source);
          });
        });
      },
      error: function (err) {
        cb(false, err);
      }
    });
  };

/**
 * @expose
 */
services.view = /** @lends {Client.prototype.view} */{
  /**
   * @param {string} viewname
   * @param {function(new:Vue)} viewclass
   * @throws {TypeError}
   */
  put: function (viewname, viewclass) {
    if (typeof viewname !== 'string' || typeof viewclass !== 'function')
      throw new TypeError('services.view.put() takes a string name and constructor.');

    VIEWS[viewname] = viewclass;
  },

  /**
   * @param {string} viewname
   * @return {?function(new:Vue)}
   * @throws {TypeError}
   */
  get: function (viewname) {
    if (typeof viewname !== 'string')
      throw new TypeError('services.view.get() takes a string name.');

    return VIEWS[viewname];
  },

  /**
   * @param {string} rootname
   * @param {function()=} cb
   * @throws {Error}
   * @this {Client}
   */
  init: function (rootname, cb) {
    var V = services.view.get(rootname);

    if (!V)
      throw new Error('view.init() cannot be called with unregistered view ' + rootname);

    getSelfAndChildren(rootname, function (template) {

      var viewname, view;

      document.body.innerHTML = '';

      if (template)
        V.options.template = template;

      services.view.put(rootname, V);

      var rootview = new V({
        ready: cb,
        el: 'body'
      });

      /**
       * @expose
       */
      window.__ROOTVIEW = rootview;

      for (viewname in VIEWS) {
        if (VIEWS.hasOwnProperty(viewname)) {
          view = VIEWS[viewname];
  
          if (!view.options.template)
            getSelfAndChildren(viewname, function (template) {
              if (template)
                view.options.template = template;

              services.view.put(viewname, view);
            });
        }
      }
    });
  }
}.service('view');

/**
 * @expose
 */
window.__VIEWS = VIEWS;