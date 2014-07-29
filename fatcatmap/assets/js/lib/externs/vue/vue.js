/**
 * @fileoverview Application type definitions.
 *
 * @author  David Rekow <david@momentum.io>,
 *          Sam Gammon <sam@momentum.io>,
 *          Alex Rosner <alex@momentum.io>,
 *          Ian Weisberger <ian@momentum.io>
 * 
 * copyright (c) momentum labs, 2014
 * @externs
 */


/** @typedef {Object} */
var VueOptions;

/** @type {Object} */
VueOptions.data;

/** @type {Object.<string, function(...)>} */
VueOptions.methods;

/** @type {Object} */
VueOptions.computed;

/** @type {Array.<string>} */
VueOptions.paramAttributes;

/** @type {Node} */
VueOptions.el

/** @type {string} */
VueOptions.template

/** @type {boolean} */
VueOptions.replace;

/** @type {string} */
VueOptions.tagName;

/** @type {string} */
VueOptions.id

/** @type {string} */
VueOptions.className;

/** @type {Object} */
VueOptions.attributes;

/** @type {function()} */
VueOptions.created;

/** @type {function()} */
VueOptions.ready;

/** @type {function()} */
VueOptions.attached;

/** @type {function()} */
VueOptions.detached;

/** @type {function()} */
VueOptions.beforeDestroy;

/** @type {function()} */
VueOptions.afterDestroy;

/** @type {Object} */
VueOptions.directives;

/** @type {Object} */
VueOptions.filters;

/** @type {Object} */
VueOptions.components;

/** @type {Object} */
VueOptions.partials;

/** @type {Object} */
VueOptions.transitions;

/** @type {boolean} */
VueOptions.lazy;

/** @type {Vue} */
VueOptions.parent;

/**
 * @constructor
 * @param {VueOptions=} options
 */
var Vue = function(options) {}

/**
 * @type {Node}
 */
Vue.prototype.$el;

/**
 * @type {Object}
 */
Vue.prototype.$data;

/**
 * @type {VueOptions}
 */
Vue.prototype.$options;

/**
 * @type {Vue}
 */
Vue.prototype.$;

/**
 * @type {number}
 */
Vue.prototype.$index;

/**
 * @type {Vue}
 */
Vue.prototype.$parent;

/**
 * @type {Vue}
 */
Vue.prototype.$root;

/**
 * @type {Object}
 */
Vue.prototype.$compiler;

/**
 * @param {string} keypath
 * @param {function(...)} callback
 */
Vue.prototype.$watch = function(keypath, callback) {};

/**
 * @param {string} keypath
 * @param {function(...)} callback
 */
Vue.prototype.$unwatch = function(keypath, callback) {};

/**
 * @param {string} keypath
 * @return {*}
 */
Vue.prototype.$get = function(keypath) {};

/**
 * @param {string} keypath
 * @param {*} value
 */
Vue.prototype.$set = function(keypath, value) {};

/**
 * @param {string} event
 * @param {...*} args
 */
Vue.prototype.$dispatch = function(event, args) {};

/**
 * @param {string} event
 * @param {...*} args
 */
Vue.prototype.$broadcast = function(event, args) {};

/**
 * @param {string} event
 * @param {...*} args
 */
Vue.prototype.$emit = function(event, args) {};

/**
 * @param {string} event
 * @param {function(...)} callback
 */
Vue.prototype.$on = function(event, callback) {};

/**
 * @param {string} event
 * @param {function(...)} callback
 */
Vue.prototype.$once = function(event, callback) {};

/**
 * @param {string=} event
 * @param {function(...)=} callback
 */
Vue.prototype.$off = function(event, callback) {};

/**
 * @param {Node|string} node
 */
Vue.prototype.$appendTo = function (node) {};

/**
 * @param {Node|string} node
 */
Vue.prototype.$before = function (node) {};

/**
 * @param {Node|string} node
 */
Vue.prototype.$after = function (node) {};

Vue.prototype.$remove = function () {};

Vue.prototype.$destroy = function () {};

/**
 * @static
 * @param {VueOptions} options
 * @return {function(new:Vue, VueOptions)}
 */
Vue.extend = function(options) {};

/**
 * @static
 * @param {Object|string} key
 * @param {*} value
 * @return {Vue}
 */
Vue.config = function(key, value) {};

/**
 * @static
 * @param {string} id
 * @param {function(...)|Object} definition
 * @return {*}
 */
Vue.directive = function(id, definition) {};

/**
 * @static
 * @param {string} id
 * @param {(function(...)|Object)=} definition
 * @return {*}
 */
Vue.filter = function(id, definition) {};

/**
 * @static
 * @param {string} id
 * @param {(function(...)|Object)=} definition
 * @return {*}
 */
Vue.component = function(id, definition) {};

/**
 * @static
 * @param {string} id
 * @param {Object=} definition
 * @return {*}
 */
Vue.effect = function(id, definition) {};

/**
 * @static
 * @param {string} id
 * @param {(string|Node)=} definition
 * @return {Node}
 */
Vue.partial = function(id, definition) {};

/**
 * @static
 * @param {function()} callback
 */
Vue.nextTick = function(callback) {};

/**
 * @static
 * @param {string} module
 */
Vue.require = function(module) {};

/**
 * @static
 * @param {function(...)|Object} plugin
 * @param {...*} args
 */
Vue.use = function(plugin, args) {};
