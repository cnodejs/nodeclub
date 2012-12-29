/*jslint node: true, regexp: true, nomen: true, indent: 2, vars: true */

'use strict';

var config = require('../config').config;
var models = require('../models');
var User = models.User;
var http = require('http');
var https = require('https');
var url = require('url');

// 使用 facebook 登入
function login(req, res, next) {
  
}

// 驗證 facebook 身份
function verify(req, res, next) {
  
}

function loginUrl(scope) {
  return 'https://www.facebook.com/dialog/oauth/?client_id=' + config.facebook.api_key + '&redirect_uri=' + config.facebook.redirect + '&scope=' + scope;
}

function accessTokenUrl(code) {
  return 'https://graph.facebook.com/oauth/access_token?client_id=' + config.facebook.api_key + '&redirect_uri=' + config.facebook.redirect + '&client_secret=' + config.facebook.secret + '&code=' + code;
}

function queryUrl(query, token) {
  return 'https://graph.facebook.com/' + query + '&method=GET&format=json&access_token=' + token;
}

function query(data, token, callback) {
  var node = data.node || 'me';
  var fields = data.fields || [];
  
  callback = typeof callback === 'function' ? callback : function () {};

  https.get(queryUrl(node + '?fields=' + fields.join(','), token), function (res) {
    var text = '';

    res.on('data', function (str) {
      text += str;
    }).on('end', function () {
      var data;
      
      try {
        data = JSON.parse(text);
      } catch (e) {
        callback(e);
        return;
      }
      
      if (data.error) {
        callback(new Error(data.error.message));
        return;
      }

      callback(null, data);
    }).on('error', function (e) {
      callback(e);
    });

  });
}

function login(req, res, next) {
  if (req.session.user) {
    return next();
  }
  res.redirect(loginUrl('email'));
}

function success(req, res, next, data) {
  query({
    node: 'me',
    fields: ['name', 'id', 'email', 'picture']
  }, data.access_token, function (error, fbUserData) {
    if (error) {
      return next(error);
    }
    User.findOne({email: fbUserData.email}, function (error, user) {
      if (error) {
        return next(error);
      }
      
      if (!user) {
        var newUser = new User();
        
        newUser.name = fbUserData.name;
        newUser.loginname = 'fb-' + fbUserData.id;
        newUser.email = fbUserData.email;
        newUser.avatar = fbUserData.picture.data.url;
        newUser.active = true;
       
        newUser.save(function (err, success) {
          if (err) {
            return next(err);
          }
          
          if (config.admins[newUser.name]) {
            req.session.is_admin = true;
          }
          req.session.user = newUser;

          res.redirect('/');
        });
        return;
      }
      
      if (config.admins[user.name]) {
        req.session.is_admin = true;
      }
      req.session.user = user;
      res.redirect('/');
    });
  });
}

function redirect(req, res, next) {
  if (req.body.error) {
    return next();
  }
  if (req.query.code) {
    https.get(accessTokenUrl(req.query.code), function (res2) {
      var text = '';
      var data;

      res2.on('data', function (str) {
        text += str;
      }).on('end', function () {
        data = url.parse('?' + text, true);
        data = data.query;
        success(req, res, next, data);
      }).on('error', function (e) {
        return next(e);
      });
    });
    return;
  }
  res.render('facebook/redirect');
}

exports.login = login;
exports.redirect = redirect;
