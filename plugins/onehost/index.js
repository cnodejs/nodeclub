/*jslint node: true, regexp: true, nomen: true, indent: 2, vars: true */

/*!
 * nodeclub - One host only
 * 
 * Redirect `HTTP GET` for `club.cnodejs.org` and `www.cnodejs.org` to `cnodejs.org`.
 * 
 * Copyright(c) 2012 fengmk2 <fengmk2@gmail.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

'use strict';

module.exports = function onehost(options) {
  options = options || {};
  var host = options.host;
  var exclude = options.exclude || [];
  if (!Array.isArray(exclude)) {
    exclude = [ exclude ];
  }
  if (host) {
    exclude.push(host);
  }
  return function (req, res, next) {
    if (!host || exclude.indexOf(req.headers.host) >= 0 || req.method !== 'GET') {
      return next();
    }
    res.writeHead(301, {
      'Location': 'http://' + host + req.url
    });
    res.end();
  };
};
