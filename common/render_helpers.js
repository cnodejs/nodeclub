/*!
 * nodeclub - common/render_helpers.js
 * Copyright(c) 2013 fengmk2 <fengmk2@gmail.com>
 * MIT Licensed
 */

"use strict";

/**
 * Module dependencies.
 */

var Remarkable = require('remarkable');
var _ = require('lodash');
var config = require('../config');
var validator = require('validator');
var multiline = require('multiline');

// Set default options
var md = new Remarkable();

md.renderer.rules.fence = function (tokens, idx) {
  var token = tokens[idx];
  var language = token.params && ('language-' + token.params) || '';
  language = validator.escape(language);
 
  return '<pre class="prettyprint ' + language + '">'
    + '<code>' + validator.escape(token.content) + '</code>'
    + '</pre>';
};

md.set({
  html: false,
  xhtmlOut: false,
  breaks: true,
  langPrefix: 'language-',
  linkify: true,
  typographer: false,
});

exports.markdown = function (text) {
  return '<div class="markdown-text">' + md.render(text || '') + '</div>';
};

exports.multiline = multiline;

exports.escapeSignature = function (signature) {
  return signature.split('\n').map(function (p) {
    return _.escape(p);
  }).join('<br>');
};

exports.staticFile = function (filePath) {
  return config.site_static_host + filePath;
};

exports.tabName = function (tab) {
  var pair = _.find(config.tabs, function (pair) {
    return pair[0] === tab;
  });
  if (pair) {
    return pair[1];
  }
};

exports._ = _;
