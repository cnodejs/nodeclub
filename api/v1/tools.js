

var UserModel = require('../../models').User;
var eventproxy = require('eventproxy');

var accesstoken = function (req, res, next) {
  var accessToken = req.body.accessToken;

  var ep = new eventproxy();
  ep.fail(next);

  UserModel.findOne({accessToken: accessToken})
    .exec(ep.done(function (user) {
      if (!user) {
        res.status(403);
        return res.send({error_msg: 'wrong accessToken'});
      }
      res.redirect('/api/v1/user/' + user.loginname);
    }));
};
exports.accesstoken = accesstoken;
