/**
 * @fileoverview localStorage and sessionStorage adapters.
 *
 * @author  David Rekow <david@momentum.io>,
 *          Sam Gammon <sam@momentum.io>,
 *          Alex Rosner <alex@momentum.io>,
 *          Ian Weisberger <ian@momentum.io>
 * 
 * copyright (c) momentum labs, 2014
 */

goog.require('supports');

goog.provide('storage');

var storage = {};

if (supports.storage.local) {
  storage.local = {};
}

if (supports.storage.session) {
  storage.session = {};
}