/*!
 * nodeclub - topic mention user controller.
 * Copyright(c) 2012 fengmk2 <fengmk2@gmail.com>
 * Copyright(c) 2012 muyuan
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var User = require('../proxy').User;
var Message = require('./message');
var EventProxy = require('eventproxy');

/**
 * 从文本中提取出@username 标记的用户名数组
 * @param {String} text 文本内容
 * @return {Array} 用户名数组
 */
var fetchUsers = function (text) {
  var results = text.match(/@[a-zA-Z0-9\-_]+/ig);
  var names = [];
  if (results) {
    for (var i = 0, l = results.length; i < l; i++) {
      var s = results[i];
      //remove char @
      s = s.slice(1);
      names.push(s);
    }
  }
  return names;
};

/**
 * 根据文本内容中读取用户，并发送消息给提到的用户
 * Callback:
 * - err, 数据库异常
 * @param {String} text 文本内容
 * @param {String} topicId 主题ID
 * @param {String} authorId 作者ID
 * @param {Function} callback 回调函数
 */
exports.sendMessageToMentionUsers = function (text, topicId, authorId, reply_id, callback) {
  if (typeof reply_id === 'function') {
    callback = reply_id;
    reply_id = null;
  }
  callback = callback || function () {
  };
  User.getUsersByNames(fetchUsers(text), function (err, users) {
    if (err || !users) {
      return callback(err);
    }
    var ep = new EventProxy();
    ep.after('sent', users.length, function () {
      callback();
    }).fail(callback);

    users.forEach(function (user) {
      Message.sendAtMessage(user._id, authorId, topicId, reply_id, ep.done('sent'));
    });
  });
};

/**
 * 根据文本内容，替换为数据库中的数据
 * Callback:
 * - err, 数据库异常
 * - text, 替换后的文本内容
 * @param {String} text 文本内容
 * @param {Function} callback 回调函数
 */
exports.linkUsers = function (text, callback) {
  User.getUsersByNames(fetchUsers(text), function (err, users) {
    if (err) {
      return callback(err);
    }
    for (var i = 0, l = users.length; i < l; i++) {
      var name = users[i].name;
      text = text.replace(new RegExp('@' + name + '(?!\s*\\])', 'gmi'), '[@' + name + '](/user/' + name + ')');
    }
    return callback(null, text);
  });
};
