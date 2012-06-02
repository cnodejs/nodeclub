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

module.exports = function onehost(options) {
  options = options || {};
  var host = options.host;
  return function (req, res, next) {
    if (!host || host === req.headers.host || req.method !== 'GET') {
      return next();
    }
    res.writeHead(301, {
      'Location': 'http://' + host + req.url
    });
    res.end();
  };
};