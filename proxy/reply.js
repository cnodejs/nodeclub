var models = require('../models');
var Reply = models.Reply;
var EventProxy = require('eventproxy');

var Util = require('../libs/util');
var User = require('./user');
var at = require('../services/at');

/**
 * 获取一条回复信息
 * @param {String} id 回复ID
 * @param {Function} callback 回调函数
 */
exports.getReply = function (id, callback) {
  Reply.findOne({_id: id}, callback);
};

/**
 * 根据回复ID，获取回复
 * Callback:
 * - err, 数据库异常
 * - reply, 回复内容
 * @param {String} id 回复ID
 * @param {Function} callback 回调函数
 */
exports.getReplyById = function (id, callback) {
  Reply.findOne({_id: id}, function (err, reply) {
    if (err) {
      return callback(err);
    }
    if (!reply) {
      return callback(err, null);
    }

    var author_id = reply.author_id;
    User.getUserById(author_id, function (err, author) {
      if (err) {
        return callback(err);
      }
      reply.author = author;
      reply.friendly_create_at = Util.format_date(reply.create_at, true);
      // TODO: 添加更新方法，有些旧帖子可以转换为markdown格式的内容
      if (reply.content_is_html) {
        return callback(null, reply);
      }
      at.linkUsers(reply.content, function (err, str) {
        if (err) {
          return callback(err);
        }
        reply.content = str;
        return callback(err, reply);
      });
    });
  });
};

/**
 * 根据主题ID，获取回复列表
 * Callback:
 * - err, 数据库异常
 * - replies, 回复列表
 * @param {String} id 主题ID
 * @param {Function} callback 回调函数
 */
exports.getRepliesByTopicId = function (id, cb) {
  Reply.find({topic_id: id}, [], {sort: [
    ['create_at', 'asc']
  ]}, function (err, replies) {
    if (err) {
      return cb(err);
    }
    if (replies.length === 0) {
      return cb(null, []);
    }

    var proxy = new EventProxy();
    var done = function () {
      var replies2 = [];
      for (var i = replies.length - 1; i >= 0; i--) {
        if (replies[i].reply_id) {
          replies2.push(replies[i]);
          replies.splice(i, 1);
        }
      }
      for (var j = 0; j < replies.length; j++) {
        replies[j].replies = [];
        for (var k = 0; k < replies2.length; k++) {
          var id1 = replies[j]._id;
          var id2 = replies2[k].reply_id;
          if (id1.toString() === id2.toString()) {
            replies[j].replies.push(replies2[k]);
          }
        }
        replies[j].replies.reverse();
      }
      return cb(err, replies);
    };
    proxy.after('reply_find', replies.length, done);
    for (var j = 0; j < replies.length; j++) {
      (function (i) {
        var author_id = replies[i].author_id;
        User.getUserById(author_id, function (err, author) {
          if (err) {
            return cb(err);
          }
          replies[i].author = author || { _id: '' };
          replies[i].friendly_create_at = Util.format_date(replies[i].create_at, true);
          if (replies[i].content_is_html) {
            return proxy.emit('reply_find');
          }
          at.linkUsers(replies[i].content, function (err, str) {
            if (err) {
              return cb(err);
            }
            replies[i].content = str;
            proxy.emit('reply_find');
          });
        });
      })(j);
    }
  });
};

/**
 * 创建并保存一条回复信息
 * @param {String} content 回复内容
 * @param {String} topicId 主题ID
 * @param {String} authorId 回复作者
 * @param {String} [replyId] 回复ID，当二级回复时设定该值
 * @param {Function} callback 回调函数
 */
exports.newAndSave = function (content, topicId, authorId, replyId, callback) {
  if (typeof replyId === 'function') {
    callback = replyId;
    replyId = null;
  }
  var reply = new Reply();
  reply.content = content;
  reply.topic_id = topicId;
  reply.author_id = authorId;
  if (replyId) {
    reply.reply_id = replyId;
  }
  reply.save(function (err) {
    callback(err, reply);
  });
};

exports.getRepliesByAuthorId = function (authorId, opt, callback) {
  if (!callback) {
    callback = opt;
    opt = null;
  }
  Reply.find({author_id: authorId}, {}, opt, callback);
};
