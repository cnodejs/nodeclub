

var eventproxy = require('eventproxy');

var accesstoken = function (req, res, next) {
  var ep = new eventproxy();
  ep.fail(next);

  res.redirect('/api/v1/user/' + req.user.loginname);
};
exports.accesstoken = accesstoken;
