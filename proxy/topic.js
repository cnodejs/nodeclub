var EventProxy = require('eventproxy');

var models = require('../models');
var Topic = models.Topic;
var TopicTag = models.TopicTag;
var User = require('./user');
var Tag = require('./tag');
var Reply = require('./reply');
var Util = require('../libs/util');

/**
 * 根据主题ID获取主题
 * Callback:
 * - err, 数据库错误
 * - topic, 主题
 * - tags, 标签列表
 * - author, 作者
 * - lastReply, 最后回复
 * @param {String} id 主题ID
 * @param {Function} callback 回调函数
 */
exports.getTopicById = function (id, callback) {
  var proxy = new EventProxy();
  var events = ['topic', 'tags', 'author', 'last_reply'];
  proxy.assign(events, function (topic, tags, author, last_reply) {
    return callback(null, topic, tags, author, last_reply);
  }).fail(callback);

  Topic.findOne({_id: id}, proxy.done(function (topic) {
    if (!topic) {
      proxy.emit('topic', null);
      proxy.emit('tags', []);
      proxy.emit('author', null);
      proxy.emit('last_reply', null);
      return;
    }
    proxy.emit('topic', topic);

    // TODO: 可以只查tag_id这个字段的吧？
    TopicTag.find({topic_id: topic._id}, proxy.done(function (topic_tags) {
      var tags_id = [];
      for (var i = 0; i < topic_tags.length; i++) {
        tags_id.push(topic_tags[i].tag_id);
      }
      Tag.getTagsByIds(tags_id, proxy.done('tags'));
    }));

    User.getUserById(topic.author_id, proxy.done('author'));

    if (topic.last_reply) {
      Reply.getReplyById(topic.last_reply, proxy.done(function (last_reply) {
        proxy.emit('last_reply', last_reply || null);
      }));
    } else {
      proxy.emit('last_reply', null);
    }
  }));
};

/**
 * 获取关键词能搜索到的主题数量
 * Callback:
 * - err, 数据库错误
 * - count, 主题数量
 * @param {String} query 搜索关键词
 * @param {Function} callback 回调函数
 */
exports.getCountByQuery = function (query, callback) {
  Topic.count(query, callback);
};

/**
 * 根据关键词，获取主题列表
 * Callback:
 * - err, 数据库错误
 * - count, 主题列表
 * @param {String} query 搜索关键词
 * @param {Object} opt 搜索选项
 * @param {Function} callback 回调函数
 */
exports.getTopicsByQuery = function (query, opt, callback) {
  Topic.find(query, ['_id'], opt, function (err, docs) {
    if (err) {
      return callback(err);
    }
    if (docs.length === 0) {
      return callback(null, []);
    }

    var topics_id = [];
    for (var i = 0; i < docs.length; i++) {
      topics_id.push(docs[i]._id);
    }

    var proxy = new EventProxy();
    var topics = [];
    proxy.after('topic_ready', topics_id.length, function () {
      return callback(null, topics);
    });
    proxy.fail(callback);

    topics_id.forEach(function (id, i) {
      exports.getTopicById(id, proxy.done(function (topic, tags, author, last_reply) {
        topic.tags = tags;
        topic.author = author;
        topic.reply = last_reply;
        topic.friendly_create_at = Util.format_date(topic.create_at, true);
        topics[i] = topic;
        proxy.emit('topic_ready');
      }));
    });
  });
};

/**
 * 获取所有信息的主题
 * Callback:
 * - err, 数据库异常
 * - message, 消息
 * - topic, 主题
 * - tags, 主题的标签
 * - author, 主题作者
 * - replies, 主题的回复
 * @param {String} id 主题ID
 * @param {Function} callback 回调函数
 */
exports.getFullTopic = function (id, callback) {
  var proxy = new EventProxy();
  var events = ['topic', 'tags', 'author', 'replies'];
  proxy.assign(events, function (topic, tags, author, replies) {
    callback(null, '', topic, tags, author, replies);
  }).fail(callback);

  Topic.findOne({_id: id}, proxy.done(function (topic) {
    if (!topic) {
      proxy.unbind();
      return callback(null, '此话题不存在或已被删除。');
    }
    proxy.emit('topic', topic);

    TopicTag.find({topic_id: topic._id}, proxy.done(function (topic_tags) {
      var tags_ids = [];
      for (var i = 0; i < topic_tags.length; i++) {
        tags_ids.push(topic_tags[i].tag_id);
      }
      Tag.getTagsByIds(tags_ids, proxy.done('tags'));
    }));

    User.getUserById(topic.author_id, proxy.done(function (author) {
      if (!author) {
        proxy.unbind();
        return callback(null, '话题的作者丢了。');
      }
      proxy.emit('author', author);
    }));

    Reply.getRepliesByTopicId(topic._id, proxy.done('replies'));
  }));
};

/**
 * 更新主题的最后回复信息
 * @param {String} topicId 主题ID
 * @param {String} replyId 回复ID
 * @param {Function} callback 回调函数
 */
exports.updateLastReply = function (topicId, replyId, callback) {
  Topic.findOne({_id: topicId}, function (err, topic) {
    if (err) {
      return callback(err);
    }
    topic.last_reply = replyId;
    topic.last_reply_at = new Date();
    topic.reply_count += 1;
    topic.save();
  });
};

/**
 * 根据主题ID，查找一条主题
 * @param {String} id 主题ID
 * @param {Function} callback 回调函数
 */
exports.getTopic = function (id, callback) {
  Topic.findOne({_id: id}, callback);
};

/**
 * 将当前主题的回复计数减1，删除回复时用到
 * @param {String} id 主题ID
 * @param {Function} callback 回调函数
 */
exports.reduceCount = function (id, callback) {
  Topic.findOne({_id: id}, function (err, topic) {
    if (err) {
      return callback(err);
    }

    if (!topic) {
      return callback(new Error('该主题不存在'));
    }

    topic.reply_count -= 1;
    topic.save(callback);
  });
};

exports.newAndSave = function (title, content, authorId, callback) {
  var topic = new Topic();
  topic.title = title;
  topic.content = content;
  topic.author_id = authorId;
  topic.save(function (err) {
    callback(err, topic);
  });
};
