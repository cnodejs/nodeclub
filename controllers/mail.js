/*jslint node: true, regexp: true, nomen: true, indent: 2, vars: true */

'use strict';

var mailer = require('nodemailer');
var config = require('../config').config;
var EventProxy = require('eventproxy').EventProxy;
var util = require('util');
var SITE_ROOT_URL;
var mails = []; // keep all the mails to send
var timer;
var mailEvent;

mailer.SMTP = {
  host: config.mail_host,
  port: config.mail_port,
  use_authentication: config.mail_use_authentication,
  user: config.mail_user,
  pass: config.mail_pass
};

SITE_ROOT_URL = 'http://' + config.hostname + (config.port !== 80 ? ':' + config.port : '');

mailEvent = new EventProxy();

function trigger() {
  mailEvent.trigger("getMail");
}

// when need to send an email, start to check the mails array and send all of emails.
mailEvent.on("getMail", function () {
  if (mails.length === 0) {
    return;
  }
  
  //遍歷郵件數組，發送每一封郵件，如果有發送失敗的，就再壓入數組，同時觸發mailEvent事件
  var failed = false;
  var i;
  var len;
  var message;
  var failedMails = [];
  var mail;
  var oldemit;
  
  function cb(message) {
    return function (error, success) {
      if (error) {
        failedMails.push(message);
        failed = true;
      }
    };
  }

  function newEmit(oldemit, mail) {
    return function () {
      oldemit.apply(mail, arguments);
    };
  }

  for (len = mails.length - 1; 0 <= len; len -= 1) {
    message = mails[len];
    mail = undefined;
    try {
      message.debug = false;
      mail = mailer.send_mail(message, cb(message));
    } catch (e) {
      failedMails.push(message);
      failed = true;
    }
    if (mail) {
      oldemit = mail.emit;
      mail.emit = newEmit(oldemit, mail);
    }
  }
  if (failed) {
    clearTimeout(timer);
    mails = failedMails;
    timer = setTimeout(trigger, 60000);
  }
});

function send_mail(data) {
  var k;
  if (!data) {
    return;
  }
  if (config.debug) {
    console.log('******************** 在測試環境下，不會真的發送郵件*******************');
    for (k in data) {
      if (data.hasOwnProperty(k)) {
        console.log('%s: %s', k, data[k]);
      }
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
             '<p>' + config.name + '社區 謹上。</p>';
  var data = {
    sender: sender,
    to: to,
    subject: subject,
    html: html
  };
  
  cb(null, true);
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
             '<p>' + config.name + '社區 謹上。</p>';
  var data = {
    sender: sender,
    to: to,
    subject: subject,
    html: html
  };

  cb(null, true);
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
             '<p>' + config.name + '社區 謹上。</p>';
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
             '<p>' + config.name + '社區 謹上。</p>';
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
