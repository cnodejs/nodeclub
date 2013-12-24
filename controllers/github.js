var sign = require('./sign');

exports.callback = function (req, res, next) {
  sign.gen_session(req.user, res);
  res.redirect('/');
};