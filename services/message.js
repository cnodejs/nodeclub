var models = require('../models');
var Message = models.Message;
var User = require('../proxy').User;
var messageProxy = require('../proxy/message');
var mail = require('./mail');

exports.sendReplyMessage = function (master_id, author_id, topic_id, reply_id) {
  var message = new Message();
  message.type = 'reply';
  message.master_id = master_id;
  message.author_id = author_id;
  message.topic_id = topic_id;
  message.reply_id = reply_id;
  message.save(function (err) {
    // TODO: 异常处理
    User.getUserById(master_id, function (err, master) {
      // TODO: 异常处理
      if (master && master.receive_reply_mail) {
        message.has_read = true;
        message.save();
        messageProxy.getMessageById(message._id, function (err, msg) {
          msg.reply_id = reply_id;
          // TODO: 异常处理
          mail.sendReplyMail(master.email, msg);
        });
      }
    });
  });
};

exports.sendReply2Message = function (master_id, author_id, topic_id, reply_id) {
  var message = new Message();
  message.type = 'reply2';
  message.master_id = master_id;
  message.author_id = author_id;
  message.topic_id = topic_id;
  message.reply_id = reply_id;
  message.save(function (err) {
    // TODO: 异常处理
    User.getUserById(master_id, function (err, master) {
      // TODO: 异常处理
      if (master && master.receive_reply_mail) {
        message.has_read = true;
        message.save();
        messageProxy.getMessageById(message._id, function (err, msg) {
          msg.reply_id = reply_id;
          // TODO: 异常处理
          mail.sendReplyMail(master.email, msg);
        });
      }
    });
  });
};

exports.sendAtMessage = function (master_id, author_id, topic_id, reply_id, callback) {
  var message = new Message();
  message.type = 'at';
  message.master_id = master_id;
  message.author_id = author_id;
  message.topic_id = topic_id;
  message.reply_id = reply_id;
  message.save(function (err) {
    // TODO: 异常处理
    User.getUserById(master_id, function (err, master) {
      // TODO: 异常处理
      if (master && master.receive_at_mail) {
        message.has_read = true;
        message.save();
        messageProxy.getMessageById(message._id, function (err, msg) {
          // TODO: 异常处理
          mail.sendAtMail(master.email, msg);
        });
      }
    });
    callback(err);
  });
};

exports.sendFollowMessage = function (follow_id, author_id) {
  var message = new Message();
  message.type = 'follow';
  message.master_id = follow_id;
  message.author_id = author_id;
  message.save();
};
