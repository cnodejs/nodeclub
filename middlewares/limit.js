var config = require('../config').config;

// 发帖时间间隔，为毫秒
var POST_INTERVAL = config.post_interval;
if (!(POST_INTERVAL > 0)) POST_INTERVAL = 0;
var DISABLE_POST_INTERVAL = POST_INTERVAL > 0 ? false : true;

/**
 * 发帖/评论时间间隔限制
 */
exports.postInterval = function (req, res, next) {
  if (DISABLE_POST_INTERVAL) return next();
  if (isNaN(req.session.lastPostTimestamp)) {
    req.session.lastPostTimestamp = Date.now();
    return next();
  }
  if (Date.now() - req.session.lastPostTimestamp < POST_INTERVAL) {
    var ERROR_MSG = '您的回复速度太快。';
    res.render('notify/notify', {error: ERROR_MSG});
    return;
  }

  req.session.lastPostTimestamp = Date.now();
  next();
};
