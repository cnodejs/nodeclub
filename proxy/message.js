var EventProxy = require('eventproxy');

var Message = require('../models').Message;

var User = require('./user');
var Topic = require('./topic');
var Reply = require('./reply');

/**
 * 根据用户ID，获取未读消息的数量
 * Callback:
 * 回调函数参数列表：
 * - err, 数据库错误
 * - count, 未读消息数量
 * @param {String} id 用户ID
 * @param {Function} callback 获取消息数量
 */
exports.getMessagesCount = function (id, callback) {
  Message.count({master_id: id, has_read: false}, callback);
};


/**
 * 根据消息Id获取消息
 * Callback:
 * - err, 数据库错误
 * - message, 消息对象
 * @param {String} id 消息ID
 * @param {Function} callback 回调函数
 */
exports.getMessageById = function (id, callback) {
  Message.findOne({_id: id}, function (err, message) {
    if (err) {
      return callback(err);
    }
    if (message.type === 'reply' || message.type === 'reply2' || message.type === 'at') {
      var proxy = new EventProxy();
      proxy.assign('author_found', 'topic_found', 'reply_found', function (author, topic, reply) {
        message.author = author;
        message.topic = topic;
        message.reply = reply;
        if (!author || !topic) {
          message.is_invalid = true;
        }
        return callback(null, message);
      }).fail(callback); // 接收异常
      User.getUserById(message.author_id, proxy.done('author_found'));
      Topic.getTopicById(message.topic_id, proxy.done('topic_found'));
      Reply.getReplyById(message.reply_id, proxy.done('reply_found'));
    }

    if (message.type === 'follow') {
      User.getUserById(message.author_id, function (err, author) {
        if (err) {
          return callback(err);
        }
        message.author = author;
        if (!author) {
          message.is_invalid = true;
        }
        return callback(null, message);
      });
    }
  });
};

/**
 * 根据用户ID，获取消息列表
 * Callback:
 * - err, 数据库异常
 * - messages, 消息列表
 * @param {String} userId 用户ID
 * @param {Function} callback 回调函数
 */
exports.getReadMessagesByUserId = function (userId, callback) {
  Message.find({master_id: userId, has_read: true}, null, {sort: [
    ['create_at', 'desc']
  ], limit: 20}, callback);
};

/**
 * 根据用户ID，获取未读消息列表
 * Callback:
 * - err, 数据库异常
 * - messages, 未读消息列表
 * @param {String} userId 用户ID
 * @param {Function} callback 回调函数
 */
exports.getUnreadMessageByUserId = function (userId, callback) {
  Message.find({master_id: userId, has_read: false}, null, {sort: [
    ['create_at', 'desc']
  ]}, callback);
};
