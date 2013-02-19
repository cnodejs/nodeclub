var sanitize = require('validator').sanitize;

var at = require('../services/at');
var message = require('../services/message');

var EventProxy = require('eventproxy');

var User = require('../proxy').User;
var Topic = require('../proxy').Topic;
var Reply = require('../proxy').Reply;

/**
 * 添加一级回复
 */
exports.add = function (req, res, next) {
  // TODO: 换成中间件的方式做统一校验
  if (!req.session || !req.session.user) {
    res.send('forbidden!');
    return;
  }

  var content = req.body.r_content;
  var topic_id = req.params.topic_id;

  var str = sanitize(content).trim();
  if (str === '') {
    res.render('notify/notify', {error: '回复内容不能为空！'});
    return;
  }

  var proxy = new EventProxy();
  proxy.assign('reply_saved', 'message_saved', 'score_saved', function () {
    res.redirect('/topic/' + topic_id);
  });

  Reply.newAndSave(content, topic_id, req.session.user._id, function (err, reply) {
    if (err) {
      return next(err);
    }
    Topic.updateLastReply(topic_id, reply._id, function (err) {
      if (err) {
        return next(err);
      }
      proxy.emit('reply_saved');
      //发送at消息
      at.sendMessageToMentionUsers(content, topic_id, req.session.user._id);
    });
  });

  Topic.getTopic(topic_id, function (err, topic) {
    if (err) {
      return next(err);
    }
    if (topic.author_id.toString() !== req.session.user._id.toString()) {
      message.sendReplyMessage(topic.author_id, req.session.user._id, topic._id);
    }
    proxy.emit('message_saved');
  });

  User.getUserById(req.session.user._id, function (err, user) {
    if (err) {
      return next(err);
    }
    user.score += 5;
    user.reply_count += 1;
    user.save();
    req.session.user.score += 5;
    proxy.emit('score_saved');
  });
};

/**
 * 添加二级回复
 */
exports.add_reply2 = function (req, res, next) {
  if (!req.session || !req.session.user) {
    res.send('forbidden!');
    return;
  }

  var topic_id = req.params.topic_id;
  var reply_id = req.body.reply_id;
  var content = req.body.r2_content;

  var str = sanitize(content).trim();
  if (str === '') {
    res.send('');
    return;
  }

  var proxy = new EventProxy();
  proxy.assign('reply_saved', 'message_saved', function (reply) {
    Reply.getReplyById(reply._id, function (err, reply) {
      res.partial('reply/reply2', {object: reply, as: 'reply'});
    });
  });

  // 创建一条回复，并保存
  Reply.newAndSave(content, topic_id, req.session.user._id, reply_id, function (err, reply) {
    if (err) {
      return next(err);
    }
    // 更新主题的最后回复信息
    Topic.updateLastReply(topic_id, reply._id, function (err) {
      if (err) {
        return next(err);
      }
      proxy.emit('reply_saved', reply);
      //发送at消息
      at.sendMessageToMentionUsers(content, topic_id, req.session.user._id);
    });
  });

  // 将回复信息发送通知到相关人
  Reply.getReply(reply_id, function (err, reply) {
    if (err) {
      return next(err);
    }
    if (reply.author_id.toString() !== req.session.user._id.toString()) {
      message.sendReply2Message(reply.author_id, req.session.user._id, topic_id);
    }
    proxy.emit('message_saved');
  });
};

/**
 * 删除回复信息
 */
exports.delete = function (req, res, next) {
  var reply_id = req.body.reply_id;
  exports.getReplyById(reply_id, function (err, reply) {
    if (!reply) {
      res.json({status: 'failed'});
      return;
    }
    if (reply.author_id.toString() === req.session.user._id.toString()) {
      reply.remove();
      res.json({status: 'success'});

      if (!reply.reply_id) {
        reply.author.score -= 5;
        reply.author.reply_count -= 1;
        reply.author.save();
      }
    } else {
      res.json({status: 'failed'});
      return;
    }

    Topic.reduceCount(reply.topic_id, function () {});
  });
};
