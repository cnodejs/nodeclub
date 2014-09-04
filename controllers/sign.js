var check = require('validator').check;
var sanitize = require('validator').sanitize;
var eventproxy = require('eventproxy');

var crypto = require('crypto');
var config = require('../config').config;

var User = require('../proxy').User;
var Message = require('../proxy').Message;
var mail = require('../services/mail');

//sign up
exports.showSignup = function (req, res) {
  res.render('sign/signup');
};

exports.signup = function (req, res, next) {
  var name = sanitize(req.body.name).trim();
  name = sanitize(name).xss();
  var loginname = name.toLowerCase();
  var pass = sanitize(req.body.pass).trim();
  pass = sanitize(pass).xss();
  var email = sanitize(req.body.email).trim();
  email = email.toLowerCase();
  email = sanitize(email).xss();
  var re_pass = sanitize(req.body.re_pass).trim();
  re_pass = sanitize(re_pass).xss();

  if (name === '' || pass === '' || re_pass === '' || email === '') {
    res.render('sign/signup', {error: '信息不完整。', name: name, email: email});
    return;
  }

  if (name.length < 5) {
    res.render('sign/signup', {error: '用户名至少需要5个字符。', name: name, email: email});
    return;
  }

  try {
    check(name, '用户名只能使用0-9，a-z，A-Z。').isAlphanumeric();
  } catch (e) {
    res.render('sign/signup', {error: e.message, name: name, email: email});
    return;
  }

  if (pass !== re_pass) {
    res.render('sign/signup', {error: '两次密码输入不一致。', name: name, email: email});
    return;
  }

  try {
    check(email, '不正确的电子邮箱。').isEmail();
  } catch (e) {
    res.render('sign/signup', {error: e.message, name: name, email: email});
    return;
  }

  User.getUsersByQuery({'$or': [
    {'loginname': loginname},
    {'email': email}
  ]}, {}, function (err, users) {
    if (err) {
      return next(err);
    }
    if (users.length > 0) {
      res.render('sign/signup', {error: '用户名或邮箱已被使用。', name: name, email: email});
      return;
    }

    // md5 the pass
    pass = md5(pass);
    // create gravatar
    var avatar_url = User.makeGravatar(email);

    User.newAndSave(name, loginname, pass, email, avatar_url, false, function (err) {
      if (err) {
        return next(err);
      }
      // 发送激活邮件
      mail.sendActiveMail(email, md5(email + config.session_secret), name);
      res.render('sign/signup', {
        success: '欢迎加入 ' + config.name + '！我们已给您的注册邮箱发送了一封邮件，请点击里面的链接来激活您的帐号。'
      });
    });
  });
};

/**
 * Show user login page.
 *
 * @param  {HttpRequest} req
 * @param  {HttpResponse} res
 */
exports.showLogin = function (req, res) {
  req.session._loginReferer = req.headers.referer;
  res.render('sign/signin');
};

/**
 * define some page when login just jump to the home page
 * @type {Array}
 */
var notJump = [
  '/active_account', //active page
  '/reset_pass',     //reset password page, avoid to reset twice
  '/signup',         //regist page
  '/search_pass'    //serch pass page
];

/**
 * Handle user login.
 *
 * @param {HttpRequest} req
 * @param {HttpResponse} res
 * @param {Function} next
 */
exports.login = function (req, res, next) {
  var loginname = sanitize(req.body.name).trim().toLowerCase();
  var pass = sanitize(req.body.pass).trim();

  if (!loginname || !pass) {
    return res.render('sign/signin', { error: '信息不完整。' });
  }

  User.getUserByLoginName(loginname, function (err, user) {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.render('sign/signin', { error: '这个用户不存在。' });
    }
    pass = md5(pass);
    if (pass !== user.pass) {
      return res.render('sign/signin', { error: '密码错误。' });
    }
    if (!user.active) {
      // 从新发送激活邮件
      mail.sendActiveMail(user.email, md5(user.email + config.session_secret), user.name);
      return res.render('sign/signin', { error: '此帐号还没有被激活，激活链接已发送到 ' + user.email + ' 邮箱，请查收。' });
    }
    // store session cookie
    gen_session(user, res);
    //check at some page just jump to home page
    var refer = req.session._loginReferer || 'home';
    for (var i = 0, len = notJump.length; i !== len; ++i) {
      if (refer.indexOf(notJump[i]) >= 0) {
        refer = 'home';
        break;
      }
    }
    res.redirect(refer);
  });
};

// sign out
exports.signout = function (req, res, next) {
  req.session.destroy();
  res.clearCookie(config.auth_cookie_name, { path: '/' });
  res.redirect(req.headers.referer || 'home');
};

exports.active_account = function (req, res, next) {
  var key = req.query.key;
  var name = req.query.name;

  User.getUserByName(name, function (err, user) {
    if (err) {
      return next(err);
    }
    if (!user || md5(user.email + config.session_secret) !== key) {
      return res.render('notify/notify', {error: '信息有误，帐号无法被激活。'});
    }
    if (user.active) {
      return res.render('notify/notify', {error: '帐号已经是激活状态。'});
    }
    user.active = true;
    user.save(function (err) {
      if (err) {
        return next(err);
      }
      res.render('notify/notify', {success: '帐号已被激活，请登录'});
    });
  });
};

exports.showSearchPass = function (req, res) {
  res.render('sign/search_pass');
};

exports.updateSearchPass = function (req, res, next) {
  var email = req.body.email;
  email = email.toLowerCase();

  try {
    check(email, '不正确的电子邮箱。').isEmail();
  } catch (e) {
    res.render('sign/search_pass', {error: e.message, email: email});
    return;
  }

  // 动态生成retrive_key和timestamp到users collection,之后重置密码进行验证
  var retrieveKey = randomString(15);
  var retrieveTime = new Date().getTime();
  User.getUserByMail(email, function (err, user) {
    if (!user) {
      res.render('sign/search_pass', {error: '没有这个电子邮箱。', email: email});
      return;
    }
    user.retrieve_key = retrieveKey;
    user.retrieve_time = retrieveTime;
    user.save(function (err) {
      if (err) {
        return next(err);
      }
      // 发送重置密码邮件
      mail.sendResetPassMail(email, retrieveKey, user.name);
      res.render('notify/notify', {success: '我们已给您填写的电子邮箱发送了一封邮件，请在24小时内点击里面的链接来重置密码。'});
    });
  });
};

/**
 * reset password
 * 'get' to show the page, 'post' to reset password
 * after reset password, retrieve_key&time will be destroy
 * @param  {http.req}   req
 * @param  {http.res}   res
 * @param  {Function} next
 */
exports.reset_pass = function (req, res, next) {
  var key = req.query.key;
  var name = req.query.name;
  User.getUserByQuery(name, key, function (err, user) {
    if (!user) {
      return res.render('notify/notify', {error: '信息有误，密码无法重置。'});
    }
    var now = new Date().getTime();
    var oneDay = 1000 * 60 * 60 * 24;
    if (!user.retrieve_time || now - user.retrieve_time > oneDay) {
      return res.render('notify/notify', {error: '该链接已过期，请重新申请。'});
    }
    return res.render('sign/reset', {name: name, key: key});
  });
};

exports.update_pass = function (req, res, next) {
  var psw = req.body.psw || '';
  var repsw = req.body.repsw || '';
  var key = req.body.key || '';
  var name = req.body.name || '';
  if (psw !== repsw) {
    return res.render('sign/reset', {name: name, key: key, error: '两次密码输入不一致。'});
  }
  User.getUserByQuery(name, key, function (err, user) {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.render('notify/notify', {error: '错误的激活链接'});
    }
    user.pass = md5(psw);
    user.retrieve_key = null;
    user.retrieve_time = null;
    user.active = true; // 用户激活
    user.save(function (err) {
      if (err) {
        return next(err);
      }
      return res.render('notify/notify', {success: '你的密码已重置。'});
    });
  });
};

// auth_user middleware
exports.auth_user = function (req, res, next) {
  var ep = new eventproxy();
  ep.fail(next);

  ep.all('get_user', function (user) {
    if (!user) {
      return next();
    }
    res.locals.current_user = req.session.user = user;
    req.session.user.avatar_url = User.getGravatar(user.email);

    if (config.admins.hasOwnProperty(user.name)) {
      user.is_admin = true;
    }
    Message.getMessagesCount(user._id, ep.done(function (count) {
      user.messages_count = count;
      next();
    }));

  });

  if (req.session.user) {
    ep.emit('get_user', req.session.user);
  } else {
    var cookie = req.cookies[config.auth_cookie_name];
    if (!cookie) {
      return next();
    }

    var auth_token = decrypt(cookie, config.session_secret);
    var auth = auth_token.split('\t');
    var user_id = auth[0];
    User.getUserById(user_id, ep.done('get_user'));
  }
};

// private
function gen_session(user, res) {
  var auth_token = encrypt(user._id + '\t' + user.name + '\t' + user.pass + '\t' + user.email, config.session_secret);
  res.cookie(config.auth_cookie_name, auth_token, {path: '/', maxAge: 1000 * 60 * 60 * 24 * 30}); //cookie 有效期30天
}

exports.gen_session = gen_session;

function encrypt(str, secret) {
  var cipher = crypto.createCipher('aes192', secret);
  var enc = cipher.update(str, 'utf8', 'hex');
  enc += cipher.final('hex');
  return enc;
}

function decrypt(str, secret) {
  var decipher = crypto.createDecipher('aes192', secret);
  var dec = decipher.update(str, 'hex', 'utf8');
  dec += decipher.final('utf8');
  return dec;
}

function md5(str) {
  var md5sum = crypto.createHash('md5');
  md5sum.update(str);
  str = md5sum.digest('hex');
  return str;
}

function randomString(size) {
  size = size || 6;
  var code_string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var max_num = code_string.length + 1;
  var new_pass = '';
  while (size > 0) {
    new_pass += code_string.charAt(Math.floor(Math.random() * max_num));
    size--;
  }
  return new_pass;
}
