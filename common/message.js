var models = require('../models');
var Message = models.Message;
var User = require('../proxy').User;
var messageProxy = require('../proxy/message');

exports.sendReplyMessage = function (master_id, author_id, topic_id, reply_id, callback) {
  var message = new Message();
  message.type = 'reply';
  message.master_id = master_id;
  message.author_id = author_id;
  message.topic_id = topic_id;
  message.reply_id = reply_id;
  message.save(callback);
};

exports.sendAtMessage = function (master_id, author_id, topic_id, reply_id, callback) {
  var message = new Message();
  message.type = 'at';
  message.master_id = master_id;
  message.author_id = author_id;
  message.topic_id = topic_id;
  message.reply_id = reply_id;
  message.save(callback);
};
