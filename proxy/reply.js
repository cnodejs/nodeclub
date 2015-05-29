var models     = require('../models');
var Reply      = models.Reply;
var EventProxy = require('eventproxy');
var tools      = require('../common/tools');
var User       = require('./user');
var at         = require('../common/at');

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
  if (!id) {
    return callback(null, null);
  }
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
  Reply.find({topic_id: id, deleted: false}, '', {sort: 'create_at'}, function (err, replies) {
    if (err) {
      return cb(err);
    }
    if (replies.length === 0) {
      return cb(null, []);
    }

    var proxy = new EventProxy();
    proxy.after('reply_find', replies.length, function () {
      cb(null, replies);
    });
    for (var j = 0; j < replies.length; j++) {
      (function (i) {
        var author_id = replies[i].author_id;
        User.getUserById(author_id, function (err, author) {
          if (err) {
            return cb(err);
          }
          replies[i].author = author || { _id: '' };
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
    replyId  = null;
  }
  var reply       = new Reply();
  reply.content   = content;
  reply.topic_id  = topicId;
  reply.author_id = authorId;

  if (replyId) {
    reply.reply_id = replyId;
  }
  reply.save(function (err) {
    callback(err, reply);
  });
};

/**
 * 根据topicId查询到最新的一条未删除回复
 * @param topicId 主题ID
 * @param callback 回调函数
 */
exports.getLastReplyByTopId = function (topicId, callback) {
  Reply.find({topic_id: topicId, deleted: false}, '_id', {sort: {create_at : -1}, limit : 1}, callback);
};

exports.getRepliesByAuthorId = function (authorId, opt, callback) {
  if (!callback) {
    callback = opt;
    opt      = null;
  }
  Reply.find({author_id: authorId}, {}, opt, callback);
};

// 通过 author_id 获取回复总数
exports.getCountByAuthorId = function (authorId, callback) {
  Reply.count({author_id: authorId}, callback);
};
