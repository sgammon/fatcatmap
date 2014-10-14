/**
 * @fileoverview User agent & feature detection.
 *
 * @author  David Rekow <david@momentum.io>,
 *          Sam Gammon <sam@momentum.io>,
 *          Alex Rosner <alex@momentum.io>,
 *          Ian Weisberger <ian@momentum.io>
 * 
 * copyright (c) momentum labs, 2014
 */

goog.provide('support');

var support = /** @struct */{

  /**
   * @type {boolean}
   */
  cookies: navigator.cookieEnabled,

  /**
   * @type {boolean}
   */
  retina: window.devicePixelRatio == 2,

  /**
   * @type {boolean}
   */
  workers: !!window.Worker,

  /**
   * @type {boolean}
   */
  sharedWorkers: !!window.SharedWorker,

  /**
   * @type {boolean}
   */
  socket: !!window.WebSocket,

  /**
   * @type {boolean}
   */
  sse: !!window.EventSource,

  /**
   * @type {boolean}
   */
  geo: !!navigator.geolocation,

  /**
   * @type {boolean}
   */
  touch: navigator.maxTouchPoints > 0,

  /**
   * @type {Object.<{html5: boolean, hash: boolean}>}
   */
  history: {
    html5: !!window.history.pushState,
    hash: !!window.onhashchange
  },

  /**
   * @type {Object.<{local: boolean, session: boolean, indexed: boolean}>}
   */
  storage: {
    local: !!window.localStorage,
    session: !!window.sessionStorage,
    indexed: !!window.IDBFactory
  }
};
