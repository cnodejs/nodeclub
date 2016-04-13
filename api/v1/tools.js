var eventproxy = require('eventproxy');

var accesstoken = function (req, res, next) {
  var ep = new eventproxy();
  ep.fail(next);

  res.send({
    success: true,
    loginname: req.user.loginname,
    avatar_url: req.user.avatar_url,
    id: req.user.id
  });
};
exports.accesstoken = accesstoken;
