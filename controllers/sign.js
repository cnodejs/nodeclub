var models = require('../models'),
  User = models.User;

var check = require('validator').check,
  sanitize = require('validator').sanitize;

var crypto = require('crypto');
var config = require('../config').config;

var message_ctrl = require('./message');
var mail_ctrl = require('./mail');
var bcrypt = require('bcrypt');

//sign up
exports.signup = function(req,res,next){
  var method = req.method.toLowerCase();
  if (method === 'get'){
    res.render('sign/signup');
    return;
  }
  if(method === 'post'){
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
    
    if(name == '' || pass =='' || re_pass == '' || email ==''){
      res.render('sign/signup', {error:'信息不完整。',name:name,email:email});
      return;
    }

    if(name.length < 5){
      res.render('sign/signup', {error:'用戶名至少需要5個字符。',name:name,email:email});
      return;
    }

    try{
      check(name, '用戶名只能使用0-9，a-z，A-Z。').isAlphanumeric();
    }catch(e){
      res.render('sign/signup', {error:e.message,name:name,email:email});
      return;
    }

    if(pass != re_pass){
      res.render('sign/signup', {error:'兩次密碼輸入不一致。',name:name,email:email});
      return;
    }
      
    try{
      check(email, '不正確的電子郵箱。').isEmail();
    }catch(e){
      res.render('sign/signup', {error:e.message,name:name,email:email});
      return;
    }

    User.find({'$or':[{'loginname':loginname},{'email':email}]},function(err,users){
      if(err) return next(err);
      if(users.length > 0){
        res.render('sign/signup', {error:'用戶名或郵箱已被使用。',name:name,email:email});
        return;
      }
      
      // bcrypt the pass
      bcrypt.genSalt(config.genSalt, function(err, salt) {
	      if (err) {
		      return next(err);
	      }
	      bcrypt.hash(pass, salt, function(err, hash) {
		      if (err) {
			      return next(err);
		      }
		      // create gavatar
		      var avatar_url = 'http://www.gravatar.com/avatar/' + md5(email) + '?size=48';

		      var user = new User();
		      user.name = name;
		      user.loginname = loginname;
		      user.pass = hash;
		      user.email = email;
		      user.avatar = avatar_url;
		      user.active = false;
		      user.save(function(err){
			if (err) {
			  return next(err);
			}
			mail_ctrl.send_active_mail(email,md5(email + config.session_secret), name,email,function(err,success){
			  if(success){
			    res.render('sign/signup', {success:'歡迎加入 ' + config.name + '！我們已給您的注冊郵箱發送了一封郵件，請點擊裡面的鏈接來激活您的帳號。'});
			    return;
			  }
			});
		      });
	      });
      });
    });
  }
};

/**
 * Show user login page.
 * 
 * @param  {HttpRequest} req
 * @param  {HttpResponse} res
 */
exports.showLogin = function(req, res) {
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
 * @param  {HttpRequest} req
 * @param  {HttpResponse} res
 * @param  {Function} next
 */
exports.login = function(req, res, next) {
  var loginname = sanitize(req.body.name).trim().toLowerCase();
  var pass = sanitize(req.body.pass).trim();
  
  if (!loginname || !pass) {
    return res.render('sign/signin', { error: '信息不完整。' });
  }

  User.findOne({ 'loginname': loginname }, function (err, user) {
    if (err) return next(err);
    if (!user) {
      return res.render('sign/signin', { error:'這個用戶不存在。' });
    }
    bcrypt.compare(pass, user.pass, function (err, equal) {
	    if (err) {
		    return next(err);
	    }
	    if (!equal) {
		    return res.render('sign/signin', { error:'密碼錯誤。' });
	    }
	    if (!user.active) {
	      res.render('sign/signin', { error:'此帳號還沒有被激活。' });
	      return;
	    }
	    // store session cookie
	    gen_session(user, res);
	    //check at some page just jump to home page 
	    var refer = req.session._loginReferer || 'home';
	    for (var i=0, len=notJump.length; i!=len; ++i) {
	      if (refer.indexOf(notJump[i]) >= 0) {
		refer = 'home';
		break;
	      }
	    }
	    res.redirect(refer);
    });
  });
};

// sign out
exports.signout = function(req, res, next) {
  req.session.destroy();
  res.clearCookie(config.auth_cookie_name, { path: '/' });
  res.redirect(req.headers.referer || 'home');
};

exports.active_account = function(req,res,next) {
  var key = req.query.key;
  var name = req.query.name;
  var email = req.query.email;

  User.findOne({name:name},function(err,user){
    if(!user || md5(email+config.session_secret) != key){
      res.render('notify/notify',{error: '信息有誤，帳號無法被激活。'});
      return;
    }
    if(user.active){
      res.render('notify/notify',{error: '帳號已經是激活狀態。'});
      return;
    }
    user.active = true;
    user.save(function(err){
      res.render('notify/notify',{success: '帳號已被激活，請登錄'});
    }); 
  });
}

exports.search_pass = function(req,res,next){
  var method = req.method.toLowerCase();
  if(method == 'get'){
    res.render('sign/search_pass');
  }
  if(method == 'post'){
    var email = req.body.email;
    email = email.toLowerCase();

    try{
      check(email, '不正確的電子郵箱。').isEmail();
    }catch(e){
      res.render('sign/search_pass', {error:e.message,email:email});
      return;
    }

    // User.findOne({email:email},function(err,user){
    //動態生成retrive_key和timestamp到users collection,之後重置密碼進行驗證
    var retrieveKey = randomString(15);
    var retrieveTime = new Date().getTime();
    User.findOne({email : email}, function(err, user) {
        if(!user) {
          res.render('sign/search_pass', {error:'沒有這個電子郵箱。',email:email});
          return;
        }
        user.retrieve_key = retrieveKey;
        user.retrieve_time = retrieveTime;
        user.save(function(err) {
          if(err) {
            return next(err);
          }
          mail_ctrl.send_reset_pass_mail(email, retrieveKey, user.name, function(err,success) {
          res.render('notify/notify',{success: '我們已給您填寫的電子郵箱發送了一封郵件，請在24小時內點擊裡面的鏈接來重置密碼。'});
        });
      });
    });
  } 
}
/**
 * reset password
 * 'get' to show the page, 'post' to reset password
 * after reset password, retrieve_key&time will be destroy
 * @param  {http.req}   req  
 * @param  {http.res}   res 
 * @param  {Function} next 
 */
exports.reset_pass = function(req,res,next) {
  var method = req.method.toLowerCase();
  if(method === 'get') {
    var key = req.query.key;
    var name = req.query.name;
    User.findOne({name:name, retrieve_key:key},function(err,user) {
      if(!user) {
        return res.render('notify/notify',{error: '信息有誤，密碼無法重置。'});
      }
      var now = new Date().getTime();
      var oneDay = 1000 * 60 * 60 * 24;
      if(!user.retrieve_time || now - user.retrieve_time > oneDay) {
        return res.render('notify/notify', {error : '該鏈接已過期，請重新申請。'});
      }
      return res.render('sign/reset', {name : name, key : key});
    });    
  } else {
    var psw = req.body.psw || '';
    var repsw = req.body.repsw || '';
    var key = req.body.key || '';
    var name = req.body.name || '';
    if(psw !== repsw) {
      return res.render('sign/reset', {name : name, key : key, error : '兩次密碼輸入不一致。'});
    }
    User.findOne({name:name, retrieve_key: key}, function(err, user) {
      if(!user) {
        return res.render('notify/notify', {error : '錯誤的激活鏈接'});
      }
      user.pass = md5(psw);
      user.retrieve_key = null;
      user.retrieve_time = null;
      user.active = true; // 用戶激活
      user.save(function(err) {
        if(err) {
          return next(err);
        }
        return res.render('notify/notify', {success: '你的密碼已重置。'});
      })
    })
  }
}

function getAvatarURL(user) {
  if (user.avatar_url) {
    return user.avatar_url;
  }
  var avatar_url = user.profile_image_url || user.avatar;
  if (!avatar_url) {
    avatar_url = config.site_static_host + '/images/user_icon&48.png';
  }
  return avatar_url;
}

// auth_user middleware
exports.auth_user = function(req, res, next) {
  if (req.session.user) {
    if (config.admins[req.session.user.name]) {
      req.session.user.is_admin = true;
    }
    message_ctrl.get_messages_count(req.session.user._id, function (err, count) {
      if (err) {
        return next(err);
      }
      req.session.user.messages_count = count;
      if (!req.session.user.avatar_url) {
        req.session.user.avatar_url = getAvatarURL(req.session.user);
      }
      res.local('current_user', req.session.user);
      return next();
    });
  } else {
    var cookie = req.cookies[config.auth_cookie_name];
    if (!cookie) return next();

    var auth_token = decrypt(cookie, config.session_secret);
    var auth = auth_token.split('\t');
    var user_id = auth[0];
    User.findOne({_id:user_id},function (err,user){
      if (err) {
        return next(err);
      }
      if (user) {
        if(config.admins[user.name]){
          user.is_admin = true;
        }
        message_ctrl.get_messages_count(user._id,function(err,count){
          if(err) return next(err);
          user.messages_count = count;
          req.session.user = user;
          req.session.user.avatar_url = user.avatar_url;
          res.local('current_user',req.session.user);
          return next();
        });
      }else{
        return next();  
      }
    }); 
  }
};

// private
function gen_session(user,res) {
  var auth_token = encrypt(user._id + '\t'+user.name + '\t' + user.pass +'\t' + user.email, config.session_secret);
  res.cookie(config.auth_cookie_name, auth_token, {path: '/',maxAge: 1000*60*60*24*30}); //cookie 有效期30天      
}
function encrypt(str,secret) {
   var cipher = crypto.createCipher('aes192', secret);
   var enc = cipher.update(str,'utf8','hex');
   enc += cipher.final('hex');
   return enc;
}
function decrypt(str,secret) {
   var decipher = crypto.createDecipher('aes192', secret);
   var dec = decipher.update(str,'hex','utf8');
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
  while(size>0){
    new_pass += code_string.charAt(Math.floor(Math.random()* max_num));
    size--; 
  }
  return new_pass;
}

