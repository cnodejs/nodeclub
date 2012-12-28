/*jslint node: true, regexp: true, nomen: true, indent: 2, vars: true */

'use strict';

// static page
exports.about = function (req, res, next) {
  res.render('static/about');
};

exports.faq = function (req, res, next) {
  res.render('static/faq');
};
