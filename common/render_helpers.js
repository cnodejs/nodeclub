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

// Set default options
var renderer = new marked.Renderer()
renderer.code = function(code, lang) {
  var ret = '<pre class="prettyprint language-' + lang + '">'
  ret+= '<code>' + code + '</code>'
  ret+= '</pre>'
  return ret
}
marked.setOptions({
  renderer: renderer,
  gfm: true,
  tables: true,
  breaks: true,
  pedantic: false,
  sanitize: false,
  smartLists: true
});

exports.markdown = function () {
  return function (text) {
    return '<div class="markdown-text">' + utils.xss(marked(text || '')) + '</div>';
  };
};

exports.csrf = function (req, res) {
  return req.session ? req.session._csrf : '';
};
