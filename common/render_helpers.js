/*!
 * nodeclub - common/render_helpers.js
 * Copyright(c) 2013 fengmk2 <fengmk2@gmail.com>
 * MIT Licensed
 */

"use strict";

/**
 * Module dependencies.
 */

var marked = require('marked-prettyprint');

// Set default options
marked.setOptions({
  gfm: true,
  tables: true,
  breaks: true,
  pedantic: false,
  sanitize: true,
  smartLists: true,
  codeClass: 'prettyprint',
  langPrefix: 'language-'
});

exports.markdown = function () {
  return function (text) {
    return '<div class="markdown-text">' + marked(text || '') + '</div>';
  };
};

exports.csrf = function (req, res) {
  return req.session ? req.session._csrf : '';
};
