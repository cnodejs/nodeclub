/*!
 * nodeclub - wordpress_redirect
 *   handle wordpress http://xxx/blog/?p=$pid redirect to http://nodeclub/topic/xxxx
 * 
 * Copyright(c) 2012 fengmk2 <fengmk2@gmail.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var PostToTopic = require('./model').PostToTopic;
var config = require('../../config').config;

module.exports = function wordpressRedirect() {
  var URL_RE = /^\/blog\/?\?p=(\d+)/i;
  var host = config.host;
  if (host[host.length - 1] === '/') {
    host = host.substring(0, host.length - 1);
  }
  var urlpath = host + '/topic/';
  return function(req, res, next) {
    if (!URL_RE.test(req.url)) return next();
    var m = URL_RE.exec(req.url);
    var postID = parseInt(m[1]);
    PostToTopic.findOne({ _id: postID }, function(err, o) {
      if (err) return next(err);
      if (!o) return next();
      res.redirect(urlpath + o.topic_id, 301);
    });
  }
};