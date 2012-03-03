var models = require('../models'),
	User = models.User;

var check = require('validator').check,
	sanitize = require('validator').sanitize;

var crypto = require('crypto');
var config = require('../config').config;

var message_ctrl = require('./message');
var mail_ctrl = require('./mail');

//sign up
exports.signup = function(req,res,next){
	var method = req.method.toLowerCase();
	if(method == 'get'){
		res.render('sign/signup');
		return;
	}
	if(method == 'post'){
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
			res.render('sign/signup', {error:'用户名至少需要5个字符。',name:name,email:email});
			return;
		}

		try{
			check(name, '用户名只能使用0-9，a-z，A-Z。').isAlphanumeric();
		}catch(e){
			res.render('sign/signup', {error:e.message,name:name,email:email});
			return;
		}

		if(pass != re_pass){
			res.render('sign/signup', {error:'两次密码输入不一致。',name:name,email:email});
			return;
		}
			
		try{
			check(email, '不正确的电子邮箱。').isEmail();
		}catch(e){
			res.render('sign/signup', {error:e.message,name:name,email:email});
			return;
		}

		User.find({'$or':[{'loginname':loginname},{'email':email}]},function(err,users){
			if(err) return next(err);
			if(users.length > 0){
				res.render('sign/signup', {error:'用户名或邮箱已被使用。',name:name,email:email});
				return;
			}
			
			// md5 the pass
			pass = md5(pass);
			// create gavatar
			var avatar_url = 'http://www.gravatar.com/avatar/' + md5(email) + '?size=48';

			var user = new User();
			user.name = name;
			user.loginname = loginname;
			user.pass = pass;
			user.email = email;
			user.avatar = avatar_url;
			user.active = false;
			user.save(function(err){
				if(err) return next(err);
				mail_ctrl.send_active_mail(email,md5(email+config.session_secret),name,email,function(err,success){
					if(success){
						res.render('sign/signup', {success:'欢迎加入 ' + config.name + '！我们已给您的注册邮箱发送了一封邮件，请点击里面的链接来激活您的帐号。'});
						return;
					}
				});
			});
		});
	}
};

//sign in
exports.signin = function(req,res,next){
	var method = req.method.toLowerCase();
	if(method == 'get'){
		res.render('sign/signin');
		return;
	}
	if(method == 'post'){
		var name = sanitize(req.body.name).trim();
		var loginname = name.toLowerCase();
		var pass = sanitize(req.body.pass).trim();
		
		if(name == '' || pass ==''){
			res.render('sign/signin', {error:'信息不完整。'});
			return;
		}

		User.findOne({'loginname':loginname}, function(err,user){
			if(err) return next(err);
			if(!user){
				res.render('sign/signin', {error:'这个用户不存在。'});
				return;
			}

			pass = md5(pass);
			if(pass != user.pass){
				res.render('sign/signin', {error:'密码错误。'});
				return;
			}
			if(!user.active){
				res.render('sign/signin', {error:'此帐号还没有被激活。'});
				return;
			}

			// store session cookie
			gen_session(user,res);
			res.redirect('home');
		});
	}
};

// sign out
exports.signout = function(req,res,next){
	req.session.destroy();
	res.clearCookie(config.auth_cookie_name, {path: '/'});
	res.redirect('home');
};

exports.active_account = function(req,res,next){
	var key = req.query.key;
	var name = req.query.name;
	var email = req.query.email;

	User.findOne({name:name},function(err,user){
		if(!user || md5(email+config.session_secret) != key){
			res.render('notify/notify',{error: '信息有误，帐号无法被激活。'});
			return;
		}
		if(user.active){
			res.render('notify/notify',{error: '帐号已经是激活状态。'});
			return;
		}
		user.active = true;
		user.save(function(err){
			res.render('notify/notify',{success: '帐号已被激活，请登录'});
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
			check(email, '不正确的电子邮箱。').isEmail();
		}catch(e){
			res.render('sign/search_pass', {error:e.message,email:email});
			return;
		}

		User.findOne({email:email},function(err,user){
			if(!user){
				res.render('sign/search_pass', {error:'没有这个电子邮箱。',email:email});
				return;
			}
			mail_ctrl.send_reset_pass_mail(email,md5(email+config.session_secret),user.name,function(err,success){
				res.render('notify/notify',{success: '我们已给您填写的电子邮箱发送了一封邮件，请点击里面的链接来重置密码。'});
			});
		});
	}	
}

exports.reset_pass = function(req,res,next){
	var key = req.query.key;
	var name = req.query.name;
	var new_pass = '';

	User.findOne({name:name},function(err,user){
		if(!user || md5(user.email+config.session_secret) != key){
			res.render('notify/notify',{error: '信息有误，密码无法重置。'});
			return;
		}
		new_pass = random_password();
		user.pass = md5(new_pass);
		user.save(function(err){
			res.render('notify/notify',{success: '你的密码已被重置为：' + new_pass + '，请立即用此密码登录后在设置页面更改密码。'});
		});	
	});

}

// auth_user middleware
exports.auth_user = function(req,res,next){
	if(req.session.user){
		if(config.admins[req.session.user.name]){
			req.session.user.is_admin = true;
		}
		message_ctrl.get_messages_count(req.session.user._id,function(err,count){
			if(err) return next(err);
			req.session.user.messages_count = count;
			res.local('current_user',req.session.user);
			return next();
		});
	}else{
		var cookie = req.cookies[config.auth_cookie_name];
		if(!cookie) return next();

		var auth_token = decrypt(cookie, config.session_secret);
		var auth = auth_token.split('\t');
		var user_id = auth[0];
		User.findOne({_id:user_id},function(err,user){
			if(err) return next(err);
			if(user){
				if(config.admins[user.name]){
					user.is_admin = true;
				}
				message_ctrl.get_messages_count(user._id,function(err,count){
					if(err) return next(err);
					user.messages_count = count;
					req.session.user = user;
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
function gen_session(user,res){
	var auth_token = encrypt(user._id + '\t'+user.name + '\t' + user.pass +'\t' + user.email, config.session_secret);
	res.cookie(config.auth_cookie_name, auth_token, {path: '/',maxAge: 1000*60*60*24*7}); //cookie 有效期1周			
}
function encrypt(str,secret){
   var cipher = crypto.createCipher('aes192', secret);
   var enc = cipher.update(str,'utf8','hex');
   enc += cipher.final('hex');
   return enc;
}
function decrypt(str,secret){
   var decipher = crypto.createDecipher('aes192', secret);
   var dec = decipher.update(str,'hex','utf8');
   dec += decipher.final('utf8');
   return dec;
}
function md5(str){
	var md5sum = crypto.createHash('md5');
	md5sum.update(str);
	str = md5sum.digest('hex');
	return str;
}
function random_password(passwd_size){
	var size = passwd_size || 6;
	var code_string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';	
	var max_num = code_string.length + 1;
	var new_pass = '';
	while(size>0){
	  new_pass += code_string.charAt(Math.floor(Math.random()* max_num));
	  size--;	
	}
	return new_pass;
}