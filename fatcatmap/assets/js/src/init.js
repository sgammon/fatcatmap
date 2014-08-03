/**
 * @fileoverview Catnip application initializer.
 *
 * @author  David Rekow <david@momentum.io>,
 *          Sam Gammon <sam@momentum.io>,
 *          Alex Rosner <alex@momentum.io>,
 *          Ian Weisberger <ian@momentum.io>
 * 
 * copyright (c) momentum labs, 2014
 */

goog.require('catnip');
goog.require('config');
goog.require('routes');

goog.provide('init');

/**
 * @expose
 */
window.catnip_beta = catnip.init(config.context, config.data);

