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

module.exports = function wordpressRedirect(options) {
  options = options || {};
  var root = options.root || '/topic/';
  if (root[root.length - 1] !== '/') {
    root += '/';
  }
  var URL_RE = options.match || /^\/blog\/?\?p=(\d+)/i;
  return function (req, res, next) {
    if (!URL_RE.test(req.url)) {
      return next();
    }
    var m = URL_RE.exec(req.url);
    var postId = parseInt(m[1], 10);
    PostToTopic.findOne({ _id: postId }, function (err, o) {
      if (err) {
        return next(err);
      }
      if (!o) {
        return next();
      }
      res.redirect(root + o.topic_id, 301);
    });
  };
};