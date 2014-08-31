/**
 * 需要管理员权限
 */
exports.adminRequired = function (req, res, next) {
  if (!req.session.user) {
    return res.render('notify/notify', {error: '你还没有登录。'});
  }
  if (!req.session.user.is_admin) {
    return res.render('notify/notify', {error: '管理员才能编辑标签。'});
  }
  next();
};

/**
 * 需要登录
 */
exports.userRequired = function (req, res, next) {
  if (!req.session || !req.session.user) {
    return res.send(403, 'forbidden!');
  }
  next();
};

/**
 * 需要登录，响应错误页面
 */
exports.signinRequired = function (req, res, next) {
  if (!req.session.user) {
    res.render('notify/notify', {error: '未登入用户不能发布话题。'});
    return;
  }
  next();
};

exports.blockUser = function () {
  return function (req, res, next) {
    if (req.session.user && req.session.user.is_block && req.method !== 'GET') {
      return res.send(403, '您已被管理员屏蔽了。有疑问请联系 @alsotang。');
    }
    next();
  };
}
