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
var utils = require('../libs/util');
var _ = require('lodash');

// Set default options
var renderer = new marked.Renderer();

renderer.code = function (code, lang) {
  var language = lang && (' language-' + lang) || '';
  return '<pre class="prettyprint' + language + '">'
    + '<code>' + code.replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</code>'
    + '</pre>';
};

marked.setOptions({
  renderer: renderer,
  gfm: true,
  tables: true,
  breaks: true,
  pedantic: false,
  sanitize: false,
  smartLists: true
});

exports.markdown = function (text) {
  return '<div class="markdown-text">' + utils.xss(marked(text || '')) + '</div>';
};

exports.escapeSignature = function (signature) {
  return signature.split('\n').map(function (p) {
    return _.escape(p);
  }).join('<br>');
};