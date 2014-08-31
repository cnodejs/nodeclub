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
  var content = req.body.r_content;
  var topic_id = req.params.topic_id;

  var str = sanitize(content).trim();
  if (str === '') {
    res.render('notify/notify', {error: '回复内容不能为空！'});
    return;
  }

  var ep = EventProxy.create();
  ep.fail(next);

  Topic.getTopic(topic_id, ep.doneLater(function (topic) {
    if (!topic) {
      ep.unbind();
      // just 404 page
      return next();
    }
    ep.emit('topic', topic);
  }));

  ep.on('topic', function (topic) {
    Reply.newAndSave(content, topic_id, req.session.user._id, ep.done(function (reply) {
      Topic.updateLastReply(topic_id, reply._id, ep.done(function () {
        ep.emit('reply_saved', reply);
        //发送at消息
        at.sendMessageToMentionUsers(content, topic_id, req.session.user._id, reply._id);
      }));
    }));

    User.getUserById(req.session.user._id, ep.done(function (user) {
      user.score += 5;
      user.reply_count += 1;
      user.save();
      req.session.user = user;
      ep.emit('score_saved');
    }));
  });

  ep.all('reply_saved', 'topic', function (reply, topic) {
    if (topic.author_id.toString() !== req.session.user._id.toString()) {
      message.sendReplyMessage(topic.author_id, req.session.user._id, topic._id, reply._id);
    }
    ep.emit('message_saved');
  });

  ep.all('reply_saved', 'message_saved', 'score_saved', function (reply) {
    res.redirect('/topic/' + topic_id + '#' + reply._id);
  });
};

/**
 * 添加二级回复
 */
exports.add_reply2 = function (req, res, next) {
  var topic_id = req.params.topic_id;
  var reply_id = req.body.reply_id;
  var content = req.body.r2_content;

  var str = sanitize(content).trim();
  if (str === '') {
    res.send('');
    return;
  }

  var proxy = new EventProxy();
  proxy.assign('reply_saved', function (reply) {
    Reply.getReplyById(reply._id, function (err, reply) {
      res.redirect('/topic/' + topic_id + '#' + reply._id);
      // res.partial('reply/reply2', {object: reply, as: 'reply'});
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
      at.sendMessageToMentionUsers(content, topic_id, req.session.user._id, reply._id);
    });
  });
};

/**
 * 删除回复信息
 */
exports.delete = function (req, res, next) {
  var reply_id = req.body.reply_id;
  Reply.getReplyById(reply_id, function (err, reply) {
    if (err) {
      return next(err);
    }

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

    Topic.reduceCount(reply.topic_id, function () {
    });
  });
};
/*
 打开回复编辑器
 */
exports.showEdit = function (req, res, next) {
  if (!req.session.user) {
    res.redirect('/');
    return;
  }

  var reply_id = req.params.reply_id;
  if (reply_id.length !== 24) {
    res.render('notify/notify', {error: '此话题不存在或已被删除。'});
    return;
  }
  Reply.getReplyById(reply_id, function (err, reply) {
    if (!reply) {
      res.render('notify/notify', {error: '此回复不存在或已被删除。'});
      return;
    }
    if (String(reply.author_id) === req.session.user._id || req.session.user.is_admin) {
      res.render('reply/edit', {
        reply_id: reply._id,
        content: reply.content
      });
    } else {
      res.render('notify/notify', {error: '对不起，你不能编辑此回复。'});
    }
  });
};
/*
 提交编辑回复
 */
exports.update = function (req, res, next) {
  if (!req.session.user) {
    res.redirect('/');
    return;
  }
  var reply_id = req.params.reply_id;
  if (reply_id.length !== 24) {
    res.render('notify/notify', {error: '此回复不存在或已被删除。'});
    return;
  }

  Reply.getReplyById(reply_id, function (err, reply) {
    if (!reply) {
      res.render('notify/notify', {error: '此回复不存在或已被删除。'});
      return;
    }

    if (String(reply.author_id) === req.session.user._id || req.session.user.is_admin) {
      var content = req.body.t_content;

      reply.content = content.trim();
      if (content.length > 0) {
        reply.save(function (err) {
          if (err) {
            return next(err);
          }
          res.redirect('/topic/' + reply.topic_id + '/#' + reply._id);
        });
      } else {
        res.render('notify/notify', {error: '回复的字数太少。'});
      }
    } else {
      res.render('notify/notify', {error: '对不起，你不能编辑此回复。'});
    }
  });
};
