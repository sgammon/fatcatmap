/**
 * @fileoverview Lightweight service wrapper for WebSockets.
 *
 * @author  David Rekow <david@momentum.io>,
 *          Sam Gammon <sam@momentum.io>,
 *          Alex Rosner <alex@momentum.io>,
 *          Ian Weisberger <ian@momentum.io>
 *
 * copyright (c) momentum labs, 2014
 */

goog.require('util.url');
goog.require('support');
goog.require('service');

goog.provide('services.socket');

var Socket, SOCKETS;

/**
 * @constructor
 * @param {string} url
 * @param {MessageCallbackMap=} listeners
 */
Socket = function (url, listeners) {

};

if (support.socket) {
  /**
   * @expose
   */
  services.socket = /** @lends {ServiceContext.prototype.socket} */{
    /**
     * @expose
     * @param {string} url
     * @param {MessageCallbackMap=} listeners
     * @return {Socket}
     */
    spawn: function (url, listeners) {
      var socket = new Socket(url, listeners);

      SOCKETS[socket.url] = socket;

      return socket;
    }
  }.service('socket');
} else {
  services.socket = null;
}
