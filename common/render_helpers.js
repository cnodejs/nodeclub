/*!
 * nodeclub - common/render_helpers.js
 * Copyright(c) 2013 fengmk2 <fengmk2@gmail.com>
 * MIT Licensed
 */

"use strict";

/**
 * Module dependencies.
 */

var marked = require('marked');
var _ = require('lodash');
var config = require('../config');
var validator = require('validator');
var multiline = require('multiline');

// Set default options
var renderer = new marked.Renderer();

renderer.code = function (code, lang) {
  var language = lang && ('language-' + lang) || '';
  language = validator.escape(language);
  return '<pre class="prettyprint ' + language + '">'
    + '<code>' + validator.escape(code) + '</code>'
    + '</pre>';
};

marked.setOptions({
  renderer: renderer,
  gfm: true,
  tables: true,
  breaks: true,
  pedantic: false,
  sanitize: true,
  smartLists: true,
  smartypants: false,
});

exports.markdown = function (text) {
  return '<div class="markdown-text">' + marked(text || '') + '</div>';
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
