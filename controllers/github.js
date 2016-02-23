var Models         = require('../models');
var User           = Models.User;
var authMiddleWare = require('../middlewares/auth');
var tools          = require('../common/tools');
var eventproxy     = require('eventproxy');
var uuid           = require('node-uuid');
var validator      = require('validator');

exports.callback = function (req, res, next) {
  var profile = req.user;
  var email = profile.emails && profile.emails[0] && profile.emails[0].value;
  User.findOne({githubId: profile.id}, function (err, user) {
    if (err) {
      return next(err);
    }
    // 当用户已经是 cnode 用户时，通过 github 登陆将会更新他的资料
    if (user) {
      user.githubUsername = profile.username;
      user.githubId = profile.id;
      user.githubAccessToken = profile.accessToken;
      // user.loginname = profile.username;
      user.avatar = profile._json.avatar_url;
      user.email = email || user.email;


      user.save(function (err) {
        if (err) {
          // 根据 err.err 的错误信息决定如何回应用户，这个地方写得很难看
          if (err.message.indexOf('duplicate key error') !== -1) {
            if (err.message.indexOf('email') !== -1) {
              return res.status(500)
                .render('sign/no_github_email');
            }
            if (err.message.indexOf('loginname') !== -1) {
              return res.status(500)
                .send('您 GitHub 账号的用户名与之前在 CNodejs 注册的用户名重复了');
            }
          }
          return next(err);
        }
        authMiddleWare.gen_session(user, res);
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

  var isnew = req.body.isnew;
  var loginname = validator.trim(req.body.name || '').toLowerCase();
  var password = validator.trim(req.body.pass || '');
  var ep = new eventproxy();
  ep.fail(next);

  if (!profile) {
    return res.redirect('/signin');
  }
  delete req.session.profile;

  var email = profile.emails && profile.emails[0] && profile.emails[0].value;
  if (isnew) { // 注册新账号
    var user = new User({
      loginname: profile.username,
      pass: profile.accessToken,
      email: email,
      avatar: profile._json.avatar_url,
      githubId: profile.id,
      githubUsername: profile.username,
      githubAccessToken: profile.accessToken,
      active: true,
      accessToken: uuid.v4(),
    });
    user.save(function (err) {
      if (err) {
        // 根据 err.err 的错误信息决定如何回应用户，这个地方写得很难看
        if (err.message.indexOf('duplicate key error') !== -1) {
          if (err.message.indexOf('email') !== -1) {
            return res.status(500)
              .render('sign/no_github_email');
          }
          if (err.message.indexOf('loginname') !== -1) {
            return res.status(500)
              .send('您 GitHub 账号的用户名与之前在 CNodejs 注册的用户名重复了');
          }
        }
        return next(err);
        // END 根据 err.err 的错误信息决定如何回应用户，这个地方写得很难看
      }
      authMiddleWare.gen_session(user, res);
      res.redirect('/');
    });
  } else { // 关联老账号
    ep.on('login_error', function (login_error) {
      res.status(403);
      res.render('sign/signin', { error: '账号名或密码错误。' });
    });
    User.findOne({loginname: loginname},
      ep.done(function (user) {
        if (!user) {
          return ep.emit('login_error');
        }
        tools.bcompare(password, user.pass, ep.done(function (bool) {
          if (!bool) {
            return ep.emit('login_error');
          }
          user.githubUsername = profile.username;
          user.githubId = profile.id;
          // user.loginname = profile.username;
          user.avatar = profile._json.avatar_url;
          user.githubAccessToken = profile.accessToken;

          user.save(function (err) {
            if (err) {
              return next(err);
            }
            authMiddleWare.gen_session(user, res);
            res.redirect('/');
          });
        }));
      }));
  }
};
