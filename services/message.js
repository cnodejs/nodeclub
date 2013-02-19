var models = require('../models'),
  Message = models.Message;
var User = require('../proxy').User;
var proxy = require('../proxy').Message;

var mail = require('./mail');

exports.sendReplyMessage = function (master_id, author_id, topic_id) {
  var message = new Message();
  message.type = 'reply';
  message.master_id = master_id;
  message.author_id = author_id;
  message.topic_id = topic_id;
  message.save(function (err) {
    User.getUserById(master_id, function (err, master) {
      if (master && master.receive_reply_mail) {
        message.has_read = true;
        message.save();
        proxy.getMessageById(message._id, function (err, msg) {
          mail.sendReplyMail(master.email, msg);
        });
      }
    });
  });
};

exports.sendReply2Message = function (master_id, author_id, topic_id) {
  var message = new Message();
  message.type = 'reply2';
  message.master_id = master_id;
  message.author_id = author_id;
  message.topic_id = topic_id;
  message.save(function (err) {
    User.getUserById(master_id, function (err, master) {
      if (master && master.receive_reply_mail) {
        message.has_read = true;
        message.save();
        proxy.getMessageById(message._id, function (err, msg) {
          mail.sendReplyMail(master.email, msg);
        });
      }
    });
  });
};

exports.sendAtMessage = function (master_id, author_id, topic_id, callback) {
  var message = new Message();
  message.type = 'at';
  message.master_id = master_id;
  message.author_id = author_id;
  message.topic_id = topic_id;
  message.save(function (err) {
    User.getUserById(master_id, function (err, master) {
      if (master && master.receive_at_mail) {
        message.has_read = true;
        message.save();
        proxy.getMessageById(message._id, function (err, msg) {
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
