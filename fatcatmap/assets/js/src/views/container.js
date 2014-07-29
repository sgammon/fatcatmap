/**
 * @fileoverview Top-level view manager - root of the client app.
 *
 * @author  David Rekow <david@momentum.io>,
 *          Sam Gammon <sam@momentum.io>,
 *          Alex Rosner <alex@momentum.io>,
 *          Ian Weisberger <ian@momentum.io>
 * 
 * copyright (c) momentum labs, 2014
 */

goog.require('services.router');
goog.require('services.view');

goog.provide('views.Container');

/**
 * @constructor
 * @extends {Vue}
 * @param {VueOptions} options
 */
views.Container = Vue.extend({
  data: {
    page: {
      route: '/'
    },
    active: false
  },
  methods: {
    /**
     * @expose
     * @param {MouseEvent} e
     */
    onClick: function (e) {
      var route = e.target.getAttribute('href');
      e.preventDefault();
      e.stopPropagation();
      services.router.route(route);
    }
  },
  services: services
});

services.view.put('container', views.Container)