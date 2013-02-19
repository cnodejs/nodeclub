var mailer = require('nodemailer');
var config = require('../config').config;
var EventProxy = require('eventproxy');

mailer.SMTP = {
  host: config.mail_host,
  port: config.mail_port,
  use_authentication: config.mail_use_authentication,
  user: config.mail_user,
  pass: config.mail_pass
};

var SITE_ROOT_URL = 'http://' + config.hostname + (config.port !== 80 ? ':' + config.port : '');

/**
 * keep all the mails to send
 * @type {Array}
 */
var mails = [];
var timer;
/**
 * control mailer
 * @type {EventProxy}
 */
var mailEvent = new EventProxy();
/**
 * when need to send an email, start to check the mails array and send all of emails.
 */
mailEvent.on("getMail", function () {
  if (mails.length === 0) {
    return;
  } else {
    //遍历邮件数组，发送每一封邮件，如果有发送失败的，就再压入数组，同时触发mailEvent事件
    var failed = false;
    for (var i = 0, len = mails.length; i < len; ++i) {
      var message = mails[i];
      mails.splice(i, 1);
      i--;
      len--;
      var mail;
      try {
        message.debug = false;
        mail = mailer.send_mail(message, function (error, success) {
          if (error) {
            mails.push(message);
            failed = true;
          }
        });
      } catch (e) {
        mails.push(message);
        failed = true;
      }
      if (mail) {
        var oldemit = mail.emit;
        mail.emit = function () {
          oldemit.apply(mail, arguments);
        };
      }
    }
    if (failed) {
      clearTimeout(timer);
      timer = setTimeout(trigger, 60000);
    }
  }
});

/**
 * trigger email event
 * @return {[type]}
 */
function trigger() {
  mailEvent.emit("getMail");
}

/**
 * Send an email
 * @param {Object} data邮件对象
 */
function sendMail(data) {
  if (!data) {
    return;
  }
  if (config.debug) {
    console.log('******************** 在测试环境下，不会真的发送邮件*******************');
    for (var k in data) {
      console.log('%s: %s', k, data[k]);
    }
    return;
  }
  mails.push(data);
  trigger();
}

/**
 * 发送激活通知邮件
 * @param {String} who 接收人的邮件地址
 * @param {String} token 重置用的token字符串
 * @param {String} name 接收人的用户名
 * @param {String} email 接受人的邮件地址
 * @param {Function} callback 发送后的回调函数
 */
exports.sendActiveMail = function (who, token, name, email, callback) {
  var sender =  config.mail_sender;
  var to = who;
  var subject = config.name + '社区帐号激活';
  var html = '<p>您好：<p/>' +
    '<p>我们收到您在' + config.name + '社区的注册信息，请点击下面的链接来激活帐户：</p>' +
    '<a href="' + SITE_ROOT_URL + '/active_account?key=' + token + '&name=' + name + '&email=' + encodeURIComponent(email) + '">激活链接</a>' +
    '<p>若您没有在' + config.name + '社区填写过注册信息，说明有人滥用了您的电子邮箱，请删除此邮件，我们对给您造成的打扰感到抱歉。</p>' +
    '<p>' + config.name + '社区 谨上。</p>';
  var data = {
    sender: sender,
    to: to,
    subject: subject,
    html: html
  };
  callback(null, true);
  sendMail(data);
};

/**
 * 发送密码重置通知邮件
 * @param {String} who 接收人的邮件地址
 * @param {String} token 重置用的token字符串
 * @param {String} name 接收人的用户名
 * @param {Function} callback 发送后的回调函数
 */
exports.sendResetPassMail = function (who, token, name, callback) {
  var sender = config.mail_sender;
  var to = who;
  var subject = config.name + '社区密码重置';
  var html = '<p>您好：<p/>' +
    '<p>我们收到您在' + config.name + '社区重置密码的请求，请在24小时内单击下面的链接来重置密码：</p>' +
    '<a href="' + SITE_ROOT_URL + '/reset_pass?key=' + token + '&name=' + name + '">重置密码链接</a>' +
    '<p>若您没有在' + config.name + '社区填写过注册信息，说明有人滥用了您的电子邮箱，请删除此邮件，我们对给您造成的打扰感到抱歉。</p>' +
    '<p>' + config.name + '社区 谨上。</p>';

  var data = {
    sender: sender,
    to: to,
    subject: subject,
    html: html
  };

  callback(null, true);
  sendMail(data);
};

/**
 * 发送回复通知邮件
 * @param {String} who 接收人的邮件地址
 * @param {Object} msg 发送的消息对象
 */
exports.sendReplyMail = function (who, msg) {
  var sender =  config.mail_sender;
  var to = who;
  var subject = config.name + ' 新消息';
  var html = '<p>您好：<p/>' +
    '<p>' +
    '<a href="' + SITE_ROOT_URL + '/user/' + msg.author.name + '">' + msg.author.name + '</a>' +
    ' 在话题 ' + '<a href="' + SITE_ROOT_URL + '/topic/' + msg.topic._id + '">' + msg.topic.title + '</a>' +
    ' 中回复了你。</p>' +
    '<p>若您没有在' + config.name + '社区填写过注册信息，说明有人滥用了您的电子邮箱，请删除此邮件，我们对给您造成的打扰感到抱歉。</p>' +
    '<p>' + config.name + '社区 谨上。</p>';

  var data = {
    sender: sender,
    to: to,
    subject: subject,
    html: html
  };

  sendMail(data);
};

/**
 * 发送at通知邮件
 * @param {String} who 接收人的邮件地址
 * @param {Object} msg 发送的消息对象
 */
exports.sendAtMail = function (who, msg) {
  var sender =  config.mail_sender;
  var to = who;
  var subject = config.name + ' 新消息';
  var html = '<p>您好：<p/>' +
    '<p>' +
    '<a href="' + SITE_ROOT_URL + '/user/' + msg.author.name + '">' + msg.author.name + '</a>' +
    ' 在话题 ' + '<a href="' + SITE_ROOT_URL + '/topic/' + msg.topic._id + '">' + msg.topic.title + '</a>' +
    ' 中@了你。</p>' +
    '<p>若您没有在' + config.name + '社区填写过注册信息，说明有人滥用了您的电子邮箱，请删除此邮件，我们对给您造成的打扰感到抱歉。</p>' +
    '<p>' + config.name + '社区 谨上。</p>';

  var data = {
    sender: sender,
    to: to,
    subject: subject,
    html: html
  };

  sendMail(data);
};
