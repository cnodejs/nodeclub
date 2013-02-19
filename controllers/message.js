var models = require('../models'),
  Message = models.Message;

var user_ctrl = require('./user');
var mail_ctrl = require('./mail');
var topic_ctrl = require('./topic');

var EventProxy = require('eventproxy');

exports.index = function (req, res, next) {
  if (!req.session.user) {
    res.redirect('home');
    return;
  }

  var message_ids = [];
  var user_id = req.session.user._id;
  Message.find({master_id: user_id}, [], {sort: [['create_at', 'desc']]}, function (err, docs) {
    if (err) {
      return next(err);
    }
    for (var i = 0; i < docs.length; i++) {
      message_ids.push(docs[i]._id);
    }
    var messages = [];
    if (message_ids.length === 0) {
      res.render('message/index', {has_read_messages: [], hasnot_read_messages: []});
      return;
    }
    var proxy = new EventProxy();
    var render = function () {
      var has_read_messages = [];
      var hasnot_read_messages = [];
      for (var i = 0; i < messages.length; i++) {
        if (messages[i].is_invalid) {
          messages[i].remove();
        } else {
          if (messages[i].has_read) {
            has_read_messages.push(messages[i]);
          } else {
            hasnot_read_messages.push(messages[i]);
          }
        }
      }
      res.render('message/index', {has_read_messages: has_read_messages, hasnot_read_messages: hasnot_read_messages});
      return;
    };
    proxy.after('message_ready', message_ids.length, render);
    message_ids.forEach(function (id, i) {
      getMessageById(id, function (err, message) {
        if (err) {
          return next(err);
        }
        messages[i] = message;
        proxy.emit('message_ready');
      });
    });
  });
};

exports.mark_read = function (req, res, next) {
  if (!req.session || !req.session.user) {
    res.send('forbidden!');
    return;
  }

  var message_id = req.body.message_id;
  Message.findOne({_id: message_id}, function (err, message) {
    if (err) {
      return next(err);
    }
    if (!message) {
      res.json({status: 'failed'});
      return;
    }
    if (message.master_id.toString() !== req.session.user._id.toString()) {
      res.json({status: 'failed'});
      return;
    }
    message.has_read = true;
    message.save(function (err) {
      if (err) {
        return next(err);
      }
      res.json({status: 'success'});
    });
  });
};

exports.mark_all_read = function (req, res, next) {
  if (!req.session || !req.session.user) {
    res.send('forbidden!');
    return;
  }
  // TODO: 直接做update，无需查找然后再逐个修改。
  Message.find({master_id: req.session.user._id, has_read: false}, function (err, messages) {
    if (messages.length === 0) {
      res.json({'status': 'success'});
      return;
    }
    var proxy = new EventProxy();
    proxy.after('marked', messages.length, function () {
      res.json({'status': 'success'});
    });
    proxy.fail(next);
    for (var i = 0; i < messages.length; i++) {
      var message = messages[i];
      message.has_read = true;
      message.save(proxy.done('marked'));
    }
  });
};

exports.sendReplyMessage = function (master_id, author_id, topic_id) {
  var message = new Message();
  message.type = 'reply';
  message.master_id = master_id;
  message.author_id = author_id;
  message.topic_id = topic_id;
  message.save(function (err) {
    user_ctrl.getUserById(master_id, function (err, master) {
      if (master && master.receive_reply_mail) {
        message.has_read = true;
        message.save();
        getMessageById(message._id, function (err, msg) {
          mail_ctrl.sendReplyMail(master.email, msg);
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
    user_ctrl.getUserById(master_id, function (err, master) {
      if (master && master.receive_reply_mail) {
        message.has_read = true;
        message.save();
        getMessageById(message._id, function (err, msg) {
          mail_ctrl.sendReplyMail(master.email, msg);
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
    user_ctrl.getUserById(master_id, function (err, master) {
      if (master && master.receive_at_mail) {
        message.has_read = true;
        message.save();
        getMessageById(message._id, function (err, msg) {
          mail_ctrl.sendAtMail(master.email, msg);
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

function getMessageById(id, cb) {
  Message.findOne({_id: id}, function (err, message) {
    if (err) {
      return cb(err);
    }
    if (message.type === 'reply' || message.type === 'reply2' || message.type === 'at') {
      var proxy = new EventProxy();
      var done = function (author, topic) {
        message.author = author;
        message.topic = topic;
        if (!author || !topic) {
          message.is_invalid = true;
        }
        return cb(null, message);
      };
      proxy.assign('author_found', 'topic_found', done);
      proxy.fail(cb);
      user_ctrl.getUserById(message.author_id, proxy.done('author_found'));
      topic_ctrl.getTopicById(message.topic_id, proxy.done('topic_found'));
    }
    if (message.type === 'follow') {
      user_ctrl.getUserById(message.author_id, function (err, author) {
        if (err) {
          return cb(err);
        }
        message.author = author;
        if (!author) {
          message.is_invalid = true;
        }
        return cb(null, message);
      });
    }
  });
}

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
