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

goog.require('service');
goog.require('services.template');

goog.provide('services.view');

var VIEWS = {},

  getSelfAndChildren = function (viewname, cb) {
    /*jshint eqnull:true */
    var filename = viewname.replace('.', '/') + '.html';

    services.template.get(filename).then(function (response, error) {
      var children, source, count;

      if (error)
        return cb(false, error);

      if (response.data)
        response = response.data;

      children = [];

      source = response.source.replace(/v-component=("|')([\w\.\-]+)\1/g, function (_, __, childname) {
        children.push(childname);
        return _;
      });

      count = children.length;

      if (VIEWS[viewname])
        VIEWS[viewname].options.template = source;

      services.template.put(filename, source);

      if (count === 0)
        return cb(source);

      children.forEach(function (childname) {
        getSelfAndChildren(childname, function () {
          count -= 1;
          if (count === 0)
            cb(source);
        });
      });
    });
  };

/**
 * @expose
 */
services.view = /** @lends {ServiceContext.prototype.view} */{
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
   * @this {ServiceContext}
   */
  init: function (rootname, cb) {
    var Root = services.view.get(rootname);

    if (!Root)
      throw new Error('view.init() cannot be called with unregistered view ' + rootname);

    getSelfAndChildren(rootname, function (template, error) {
      if (error)
        return console.warn(error);

      var viewname, view;

      document.body.innerHTML = '';

      if (template)
        Root.options.template = template;

      services.view.put(rootname, Root);

      for (viewname in VIEWS) {
        /*jshint loopfunc:true */
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

      return new Root({
        ready: cb,
        el: 'body'
      });
    });
  }
}.service('view');

/** @expose */
window.VIEWS = VIEWS;
