var sign = require('./sign');
var Models = require('../models');
var User = Models.User;
var utility = require('utility');

exports.callback = function (req, res, next) {
  var profile = req.user;
  User.findOne({githubId: profile.id}, function (err, user) {
    if (err) {
      return next(err);
    }
    // 当用户已经是 cnode 用户时，通过 github 登陆将会更新他的资料
    if (user) {
      user.name = profile.username;
      user.githubUsername = profile.username;
      user.loginname = profile.username;
      user.email = profile.emails && profile.emails[0].value;
      user.avatar = profile._json && profile._json.avatar_url;
      user.save(function (err) {
        if (err) {
          return next(err);
        }
        sign.gen_session(user, res);
        return res.redirect('/');
      });
    } else {
      // 如果用户还未存在，则建立新用户
      req.session.profile = profile;
      return res.redirect('/auth/github/new');
    }
  });
};

exports.new = function (req, res, next) {
  res.render('sign/new_oauth', {actionPath: '/auth/github/create'});
};

exports.create = function (req, res, next) {
  var profile = req.session.profile;
  if (!profile) {
    return res.redirect('/signin');
  }
  delete req.session.profile;
  if (req.body.isnew) { // 注册新账号
    var user = new User({
      name: profile.username,
      loginname: profile.username,
      pass: profile.accessToken,
      email: profile.emails[0].value,
      avatar: profile._json.avatar_url,
      githubId: profile.id,
      githubUsername: profile.username,
    });
    user.save(function (err) {
      if (err) {
        if (err.err.indexOf('duplicate key error') !== -1) {
          if (err.err.indexOf('users.$email') !== -1) {
            return res.status(500)
              .render('sign/no_github_email');
          }
          if (err.err.indexOf('users.$loginname') !== -1) {
            return res.status(500)
              .send('您 GitHub 账号的用户名与之前在 CNodejs 注册的用户名重复了');
          }
        }
        return next(err);
      }
      sign.gen_session(user, res);
      res.redirect('/');
    });
  } else { // 关联老账号
    req.body.name = req.body.name.toLowerCase();
    User.findOne({loginname: req.body.name, pass: utility.md5(req.body.pass)},
      function (err, user) {
        if (err) {
          return next(err);
        }
        if (!user) {
          return res.render('sign/signin', { error: '账号名或密码错误。' });
        }
        user.githubId = profile.id;
        user.save(function (err) {
          if (err) {
            return next(err);
          }
          sign.gen_session(user, res);
          res.redirect('/');
        });
      });
  }
};
