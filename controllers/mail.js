var mailer = require('nodemailer');
var config = require('../config').config;
var EventProxy = require('eventproxy').EventProxy;
var util = require('util');
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
    //遍歷郵件數組，發送每一封郵件，如果有發送失敗的，就再壓入數組，同時觸發mailEvent事件
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
      } catch(e) {
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
  mailEvent.trigger("getMail");
}

/**
 * send an email
 * @param  {mail} data [info of an email]
 */
function send_mail(data) {
  if (!data) {
    return;
  }
  if (config.debug) {
    console.log('******************** 在測試環境下，不會真的發送郵件*******************');
    for (var k in data) {
      console.log('%s: %s', k, data[k]);
    }
    return;
  }
  mails.push(data);
  trigger();
}

function send_active_mail(who, token, name, email, cb) {
  var sender =  config.mail_sender;
  var to = who; 
  var subject = config.name + '社區帳號激活';
  var html = '<p>您好：<p/>' +
    '<p>我們收到您在' + config.name + '社區的注冊信息，請點擊下面的鏈接來激活帳戶：</p>' +
    '<a href="' + SITE_ROOT_URL + '/active_account?key=' + token + '&name=' + name + '&email=' + email + '">激活鏈接</a>' +
    '<p>若您沒有在' + config.name + '社區填寫過注冊信息，說明有人濫用了您的電子郵箱，請刪除此郵件，我們對給您造成的打擾感到抱歉。</p>' +
    '<p>' +config.name +'社區 謹上。</p>';
  var data = {
    sender: sender,
    to: to,
    subject: subject,
    html: html
  };
  cb (null, true);
  send_mail(data);
}
function send_reset_pass_mail(who, token, name, cb) {
  var sender = config.mail_sender;
  var to = who; 
  var subject = config.name + '社區密碼重置';
  var html = '<p>您好：<p/>' +
    '<p>我們收到您在' + config.name + '社區重置密碼的請求，請在24小時內單擊下面的鏈接來重置密碼：</p>' +
    '<a href="' + SITE_ROOT_URL + '/reset_pass?key=' + token + '&name=' + name + '">重置密碼鏈接</a>' +
    '<p>若您沒有在' + config.name + '社區填寫過注冊信息，說明有人濫用了您的電子郵箱，請刪除此郵件，我們對給您造成的打擾感到抱歉。</p>' +
    '<p>' + config.name +'社區 謹上。</p>';

  var data = {
    sender: sender,
    to: to,
    subject: subject,
    html: html
  };

  cb (null, true);
  send_mail(data);
}

function send_reply_mail(who, msg) {
  var sender =  config.mail_sender;
  var to = who; 
  var subject = config.name + ' 新消息';
  var html = '<p>您好：<p/>' +
    '<p>' +
    '<a href="' + SITE_ROOT_URL + '/user/' + msg.author.name + '">' + msg.author.name + '</a>' +
    ' 在話題 ' + '<a href="' + SITE_ROOT_URL + '/topic/' + msg.topic._id + '">' + msg.topic.title + '</a>' +
    ' 中回復了你。</p>' +
    '<p>若您沒有在' + config.name + '社區填寫過注冊信息，說明有人濫用了您的電子郵箱，請刪除此郵件，我們對給您造成的打擾感到抱歉。</p>' +
    '<p>' + config.name +'社區 謹上。</p>';

  var data = {
    sender: sender,
    to: to,
    subject: subject,
    html: html
  };

  send_mail(data);

}

function send_at_mail(who, msg) {
  var sender =  config.mail_sender;
  var to = who; 
  var subject = config.name + ' 新消息';
  var html = '<p>您好：<p/>' +
    '<p>' +
    '<a href="' + SITE_ROOT_URL + '/user/' + msg.author.name + '">' + msg.author.name + '</a>' +
    ' 在話題 ' + '<a href="' + SITE_ROOT_URL + '/topic/' + msg.topic._id + '">' + msg.topic.title + '</a>' +
    ' 中@了你。</p>' +
    '<p>若您沒有在' + config.name + '社區填寫過注冊信息，說明有人濫用了您的電子郵箱，請刪除此郵件，我們對給您造成的打擾感到抱歉。</p>' +
    '<p>' +config.name +'社區 謹上。</p>';

  var data = {
    sender: sender,
    to: to,
    subject: subject,
    html: html
  };

  send_mail(data);
}

exports.send_active_mail = send_active_mail;
exports.send_reset_pass_mail = send_reset_pass_mail;
exports.send_reply_mail = send_reply_mail;
exports.send_at_mail = send_at_mail;
