/**
 * @fileoverview Form validation and submission service.
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
goog.require('services.http');

goog.provide('services.form');

var FORMS, TYPES, validators, FormRequest;

FORMS = {};

TYPES = {
  'email': 'email',
  'number': 'num'
};

validators = {
  /**
   * @expose
   * @param {string} value
   * @param {Object.<{
   *   exact: number,
   *   min: number,
   *   max: number
   * }>} opts
   * @return {boolean}
   */
  length: function (value, opts) {
    /*jshint eqnull:true */
    if (opts.exact != null)
      return value.length === opts.exact;
  }
};

/**
 * @constructor
 * @private
 * @param {string} id Unique identifier for the form.
 * @param {Object.<string, Object.<string, *>>} props Property names to validate mapped to rules
 *   for validation. Rule objects can contain any of the following (defaults shown):<pre><code>{
 *  "type": "email",              // length, email, num, alphanum, <custom_validator>
 *  "required": false,
 *  "value": "test@test.com",     // default value if undefined. Will be ignored if required:true
 *  "opts": {}                    // additional options to pass to the validator,
 *  "argParse": function(string):Object   // Required. Takes arg string and returns opts object.
 *}</code></pre>
 * @param {(string|Object<string, string>)} request URL to <code>POST</code> information to, or
 *   object providing 'url' and 'method' strings.
 * @param {CallbackMap} cbs Success and error handlers for the submission response.
 * @param {function(this: ServiceContext,
 *     Object<string, *>, CallbackMap, Object.<string, string>)=} submit Pass a function
 *   expecting a map of valid input properties, and a request object with 'method' and 'url'
 *   properties, to manually dispatch form submission. Function will execute in a service
 *   context, providing access to <code>http</code> and <code>rpc</code> modules.
 */
FormRequest = function (id, props, request, cbs, submit) {

};

/**
 * @expose
 * @param {string} name Property name to retrieve.
 * @return {*} Property value.
 */
FormRequest.prototype.get = function (name) {
  return this._inputs[name];
};

/**
 * @expose
 * @param {string} name Property name to update.
 * @param {*} value Updated property value to validate and set.
 * @return {boolean} True if valid value was successfully set, false otherwise.
 */
FormRequest.prototype.set = function (name, value) {
  var isValid = true,
    props = FORMS[this.id],
    rule, validator;

  if (props && props[name]) {
    rule = props[name];
    validator = validators[rule.type];

    if (validator)
      isValid = validator(value, rule.opts);
  }

  if (isValid)
    this._inputs[name] = value;

  return isValid;
};

/**
 * @expose
 * @param {(string|Object<string, string>)} request URL to <code>POST</code> information to, or
 *   object providing 'url' and 'method' strings.
 */
FormRequest.prototype.setRequest = function (request) {
  var _request = this._request || {};

  if (typeof request === 'string') {
    _request.url = request;
    _request.method = _request.method || 'POST';
  } else {
    _request.url = request.url || _request.url;
    _request.method = request.method || _request.method || 'POST';
  }

  this._request = _request;
};

/**
 * @expose
 * @param {(string|Object<string, string>=)} request
 * @param {CallbackMap=} cbs
 * @param {function(this: ServiceContext, Object<string, *>, CallbackMap,
 *         Object.<string, string>)=} submit
 * @return {(*|Request)} Return value from submit, error handler or sent HTTP request.
 */
FormRequest.prototype.submit = function (request, cbs, submit) {
  if (request)
    this.setRequest(request);

  if (cbs)
    this.handlers = cbs;

  if (submit)
    this._submit = submit;

  request = this._request;

  if (this._submit) {
    return this._submit(this._inputs, this.handlers, this._request);
  } else {
    if (!this._request.url)
      return this.handlers.error(
        new Error('Form.submit() can\'t be called before an endpoint & method are set.'));

    request.data = this._inputs;

    FORMS[this.id] = null;

    return services.http[request.method.toLowerCase()](request, this.handlers);
  }
};

/**
 * @expose
 */
services.form = /** @lends {ServiceContext.prototype.form} */{
  /**
   * @expose
   * See {@link FormRequest} for argument descriptions.
   * @param {string} id Unique identifier for the form.
   * @param {Object.<string, Object.<string, *>>} props
   * @param {(string|Object<string, string>)} request
   * @param {CallbackMap} cbs
   * @param {function(this: ServiceContext, Object<string, *>, CallbackMap,
   *         Object.<string, string>)=} submit
   * @throws {Error} If <code>id</code> is already registered.
   */
  create: function (id, props, request, cbs, submit) {
    if (FORMS[id])
      throw new Error('Form with id ' + id + ' is already registered.');

    return new FormRequest(id, props, request, cbs, submit);
  },

  /**
   * @expose
   * @param {Node} input
   * @param {Object} data
   * @return {Object}
   * @throws {TypeError} If input is not an <code>input</code> element.
   */
  getRule: function (input, data) {
    if (input.tagName !== 'INPUT')
      throw new TypeError('service.form.getType accepts <input> elements only.');

    return {};
  }
}.service('form');