
var UserModel = require('../../models').User;
var eventproxy = require('eventproxy');

var auth = function (req, res, next) {
  var accessToken = req.body.accesstoken || req.query.accesstoken;
  var ep = new eventproxy();
  ep.fail(next);

  UserModel.findOne({accessToken: accessToken}, ep.done(function (user) {
    if (!user) {
      res.status(403);
      return res.send({error_msg: 'wrong accessToken'});
    }
    req.user = user;
    next();
  }));

};

exports.auth = auth;
