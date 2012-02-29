var mailer = require('nodemailer');
var config = require('../config').config;

mailer.SMTP = {
	host: config.mail_host,
	port: config.mail_port,
	use_authentication: config.mail_use_authentication,
	user: config.mail_user,
	pass: config.mail_pass
};

function send_mail(data,cb){
	mailer.send_mail(data,function(err,success){
		return cb(err,success);
	});
}

function send_active_mail(who,token,name,email,cb){
	var sender =  config.mail_sender;
	var to = who; 
	var subject = config.name + '社区帐号激活';
	var html = '<p>您好：<p/>' +
			   '<p>我们收到您在' + config.name + '社区的注册信息，请点击下面的链接来激活帐户：</p>' +
			   '<a href="' + config.host + '/active_account?key=' + token + '&name=' + name + '&email=' + email + '">激活链接</a>' +
			   '<p>若您没有在' + config.name + '社区填写过注册信息，说明有人滥用了您的电子邮箱，请删除此邮件，我们对给您造成的打扰感到抱歉。</p>' +
			   '<p>' +config.name +'社区 谨上。</p>'

	var data = {
		sender: sender,
		to: to,
		subject: subject,
		html: html
	}

	send_mail(data,function(err,success){
		return cb(err,success);	
	});
}
function send_reset_pass_mail(who,token,name,cb){
	var sender = config.mail_sender;
	var to = who; 
	var subject = config.name + '社区密码重置';
	var html = '<p>您好：<p/>' +
			   '<p>我们收到您在' + config.name + '社区重置密码的请求，请单击下面的链接来重置密码：</p>' +
			   '<a href="' + config.host + '/reset_pass?key=' + token + '&name=' + name + '">重置密码链接</a>' +
			   '<p>若您没有在' + config.name + '社区填写过注册信息，说明有人滥用了您的电子邮箱，请删除此邮件，我们对给您造成的打扰感到抱歉。</p>' +
			   '<p>' + config.name +'社区 谨上。</p>'

	var data = {
		sender: sender,
		to: to,
		subject: subject,
		html: html
	}

	send_mail(data,function(err,success){
		return cb(err,success);	
	});
}
function send_reply_mail(who,msg){
	var sender =  config.mail_sender;
	var to = who; 
	var subject = config.name + ' 新消息';
	var html = '<p>您好：<p/>' +
			   '<p>' +
			   '<a href="' + config.host + ':' + config.port + '/user/' + msg.author.name + '">' + msg.author.name + '</a>' +
			   ' 在话题 ' + '<a href="' + config.host + ':' + config.port + '/topic/' + msg.topic._id + '">' + msg.topic.title + '</a>' +
			   ' 中回复了你。</p>' +
			   '<p>若您没有在' + config.name + '社区填写过注册信息，说明有人滥用了您的电子邮箱，请删除此邮件，我们对给您造成的打扰感到抱歉。</p>' +
			   '<p>' +config.name +'社区 谨上。</p>'

	var data = {
		sender: sender,
		to: to,
		subject: subject,
		html: html
	}

	send_mail(data,function(err,success){});

}
function send_at_mail(who,msg){
	var sender =  config.mail_sender;
	var to = who; 
	var subject = config.name + ' 新消息';
	var html = '<p>您好：<p/>' +
			   '<p>' +
			   '<a href="' + config.host + ':' + config.port + '/user/' + msg.author.name + '">' + msg.author.name + '</a>' +
			   ' 在话题 ' + '<a href="' + config.host + ':' + config.port + '/topic/' + msg.topic._id + '">' + msg.topic.title + '</a>' +
			   ' 中@了你。</p>' +
			   '<p>若您没有在' + config.name + '社区填写过注册信息，说明有人滥用了您的电子邮箱，请删除此邮件，我们对给您造成的打扰感到抱歉。</p>' +
			   '<p>' +config.name +'社区 谨上。</p>'

	var data = {
		sender: sender,
		to: to,
		subject: subject,
		html: html
	}

	send_mail(data,function(err,success){});
}

exports.send_active_mail = send_active_mail;
exports.send_reset_pass_mail = send_reset_pass_mail;
exports.send_reply_mail = send_reply_mail;
exports.send_at_mail = send_at_mail;
