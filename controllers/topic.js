/*!
 * nodeclub - controllers/topic.js
 */

/**
 * Module dependencies.
 */

var validator = require('validator');

var at = require('../common/at');
var User = require('../proxy').User;
var Topic = require('../proxy').Topic;
var TopicCollect = require('../proxy').TopicCollect;
var EventProxy = require('eventproxy');
var tools = require('../common/tools');
var store = require('../common/store');
var config = require('../config');
var _ = require('lodash');

/**
 * Topic page
 *
 * @param  {HttpRequest} req
 * @param  {HttpResponse} res
 * @param  {Function} next
 */
exports.index = function (req, res, next) {
  function isUped(user, reply) {
    if (!reply.ups) {
      return false;
    }
    return reply.ups.indexOf(user._id) !== -1;
  }

  var topic_id = req.params.tid;
  if (topic_id.length !== 24) {
    return res.render('notify/notify', {
      error: '此话题不存在或已被删除。'
    });
  }
  var events = ['topic', 'other_topics', 'no_reply_topics'];
  var ep = EventProxy.create(events, function (topic, other_topics, no_reply_topics) {
    res.render('topic/index', {
      topic: topic,
      author_other_topics: other_topics,
      no_reply_topics: no_reply_topics,
      isUped: isUped
    });
  });

  ep.fail(next);

  Topic.getFullTopic(topic_id, ep.done(function (message, topic, author, replies) {
    if (message) {
      ep.unbind();
      return res.render('notify/notify', { error: message });
    }

    topic.visit_count += 1;
    topic.save();

    // format date
    topic.friendly_create_at = tools.formatDate(topic.create_at, true);
    topic.friendly_update_at = tools.formatDate(topic.update_at, true);

    topic.author = author;

    topic.replies = replies;

    // 点赞数排名第三的回答，它的点赞数就是阈值
    topic.reply_up_threshold = (function () {
      var allUpCount = replies.map(function (reply) {
        return reply.ups && reply.ups.length || 0;
      });
      allUpCount = _.sortBy(allUpCount, Number).reverse();

      return allUpCount[2] || 0;
    })();

    if (!req.session.user) {
      ep.emit('topic', topic);
    } else {
      TopicCollect.getTopicCollect(req.session.user._id, topic._id, ep.done(function (doc) {
        topic.in_collection = doc;
        ep.emit('topic', topic);
      }));
    }

    // get other_topics
    var options = { limit: 5, sort: '-last_reply_at'};
    var query = { author_id: topic.author_id, _id: { '$nin': [ topic._id ] } };
    Topic.getTopicsByQuery(query, options, ep.done('other_topics'));

    // get no_reply_topics
    var options2 = { limit: 5, sort: '-create_at'};
    Topic.getTopicsByQuery({reply_count: 0}, options2, ep.done('no_reply_topics'));
  }));
};

exports.create = function (req, res, next) {
  res.render('topic/edit', {
    tabs: config.tabs
  });
};


exports.put = function (req, res, next) {
  var title = validator.trim(req.body.title);
  title = validator.escape(title);
  var tab = validator.trim(req.body.tab);
  tab = validator.escape(tab);
  var content = validator.trim(req.body.t_content);

  // 得到所有的 tab, e.g. ['ask', 'share', ..]
  var allTabs = config.tabs.map(function (tPair) {
    return tPair[0];
  });

  // 验证
  var editError;
  if (title === '') {
    editError = '标题不能是空的。';
  } else if (title.length < 5 || title.length > 100) {
    editError = '标题字数太多或太少。';
  } else if (!tab || allTabs.indexOf(tab) === -1) {
    editError = '必须选择一个版块。';
  } else if (content === '') {
    editError = '内容不可为空';
  }
  // END 验证

  if (editError) {
    res.status(422);
    return res.render('topic/edit', {
      edit_error: editError,
      title: title,
      content: content,
      tabs: config.tabs
    });
  }

  Topic.newAndSave(title, content, tab, req.session.user._id, function (err, topic) {
    if (err) {
      return next(err);
    }

    var proxy = new EventProxy();

    proxy.all('score_saved', function () {
      res.redirect('/topic/' + topic._id);
    });
    proxy.fail(next);
    User.getUserById(req.session.user._id, proxy.done(function (user) {
      user.score += 5;
      user.topic_count += 1;
      user.save();
      req.session.user = user;
      proxy.emit('score_saved');
    }));

    //发送at消息
    at.sendMessageToMentionUsers(content, topic._id, req.session.user._id);
  });
};

exports.showEdit = function (req, res, next) {
  var topic_id = req.params.tid;

  Topic.getTopicById(topic_id, function (err, topic, tags) {
    if (!topic) {
      res.render('notify/notify', {error: '此话题不存在或已被删除。'});
      return;
    }

    if (String(topic.author_id) === String(req.session.user._id) || req.session.user.is_admin) {
      res.render('topic/edit', {
        action: 'edit',
        topic_id: topic._id,
        title: topic.title,
        content: topic.content,
        tab: topic.tab,
        tabs: config.tabs
      });
    } else {
      res.render('notify/notify', {error: '对不起，你不能编辑此话题。'});
    }
  });
};

exports.update = function (req, res, next) {
  var topic_id = req.params.tid;
  var title = req.body.title;
  var tab = req.body.tab;
  var content = req.body.t_content;

  Topic.getTopicById(topic_id, function (err, topic, tags) {
    if (!topic) {
      res.render('notify/notify', {error: '此话题不存在或已被删除。'});
      return;
    }

    if (topic.author_id.equals(req.session.user._id) || req.session.user.is_admin) {
      title = validator.trim(title);
      title = validator.escape(title);
      tab = validator.trim(tab);
      tab = validator.escape(tab);
      content = validator.trim(content);

      // 验证
      var editError;
      if (title === '') {
        editError = '标题不能是空的。';
      } else if (title.length < 5 || title.length > 100) {
        editError = '标题字数太多或太少。';
      } else if (!tab) {
        editError = '必须选择一个版块。';
      }
      // END 验证

      if (editError) {
        return res.render('topic/edit', {
          action: 'edit',
          edit_error: editError,
          topic_id: topic._id,
          content: content,
          tabs: config.tabs
        });
      }

      //保存话题
      topic.title = title;
      topic.content = content;
      topic.tab = tab;
      topic.update_at = new Date();
      topic.save(function (err) {
        if (err) {
          return next(err);
        }
        //发送at消息
        at.sendMessageToMentionUsers(content, topic._id, req.session.user._id);

        res.redirect('/topic/' + topic._id);

      });
    } else {
      res.render('notify/notify', {error: '对不起，你不能编辑此话题。'});
    }
  });
};

exports.delete = function (req, res, next) {
  //删除话题, 话题作者topic_count减1
  //删除回复，回复作者reply_count减1
  //删除topic_collect，用户collect_topic_count减1

  var topic_id = req.params.tid;

  Topic.getTopic(topic_id, function (err, topic) {
    if (err) {
      return res.send({ success: false, message: err.message });
    }
    if (!req.session.user.is_admin && !(topic.author_id.equals(req.session.user._id))) {
      res.status(403);
      return res.send({success: false, message: '无权限'});
    }
    if (!topic) {
      res.status(422);
      return res.send({ success: false, message: '此话题不存在或已被删除。' });
    }
    topic.deleted = true;
    topic.save(function (err) {
      if (err) {
        return res.send({ success: false, message: err.message });
      }
      res.send({ success: true, message: '话题已被删除。' });
    });
  });
};

// 设为置顶
exports.top = function (req, res, next) {
  var topic_id = req.params.tid;
  var referer = req.get('referer');
  if (topic_id.length !== 24) {
    res.render('notify/notify', {error: '此话题不存在或已被删除。'});
    return;
  }
  Topic.getTopic(topic_id, function (err, topic) {
    if (err) {
      return next(err);
    }
    if (!topic) {
      res.render('notify/notify', {error: '此话题不存在或已被删除。'});
      return;
    }
    topic.top = !topic.top;
    topic.save(function (err) {
      if (err) {
        return next(err);
      }
      var msg = topic.top ? '此话题已置顶。' : '此话题已取消置顶。';
      res.render('notify/notify', {success: msg, referer: referer});
    });
  });
};

// 设为精华
exports.good = function (req, res, next) {
  var topicId = req.params.tid;
  var referer = req.get('referer');
  Topic.getTopic(topicId, function (err, topic) {
    if (err) {
      return next(err);
    }
    if (!topic) {
      res.render('notify/notify', {error: '此话题不存在或已被删除。'});
      return;
    }
    topic.good = !topic.good;
    topic.save(function (err) {
      if (err) {
        return next(err);
      }
      var msg = topic.good ? '此话题已加精。' : '此话题已取消加精。';
      res.render('notify/notify', {success: msg, referer: referer});
    });
  });
};

// 锁定主题，不可再回复
exports.lock = function (req, res, next) {
  var topicId = req.params.tid;
  var referer = req.get('referer');
  Topic.getTopic(topicId, function (err, topic) {
    if (err) {
      return next(err);
    }
    if (!topic) {
      res.render('notify/notify', {error: '此话题不存在或已被删除。'});
      return;
    }
    topic.lock = !topic.lock;
    topic.save(function (err) {
      if (err) {
        return next(err);
      }
      var msg = topic.lock ? '此话题已锁定。' : '此话题已取消锁定。';
      res.render('notify/notify', {success: msg, referer: referer});
    });
  });
};

// 收藏主题
exports.collect = function (req, res, next) {
  var topic_id = req.body.topic_id;
  Topic.getTopic(topic_id, function (err, topic) {
    if (err) {
      return next(err);
    }
    if (!topic) {
      res.json({status: 'failed'});
    }

    TopicCollect.getTopicCollect(req.session.user._id, topic._id, function (err, doc) {
      if (err) {
        return next(err);
      }
      if (doc) {
        res.json({status: 'success'});
        return;
      }

      TopicCollect.newAndSave(req.session.user._id, topic._id, function (err) {
        if (err) {
          return next(err);
        }
        res.json({status: 'success'});
      });
      User.getUserById(req.session.user._id, function (err, user) {
        if (err) {
          return next(err);
        }
        user.collect_topic_count += 1;
        user.save();
      });

      req.session.user.collect_topic_count += 1;
      topic.collect_count += 1;
      topic.save();
    });
  });
};

exports.de_collect = function (req, res, next) {
  var topic_id = req.body.topic_id;
  Topic.getTopic(topic_id, function (err, topic) {
    if (err) {
      return next(err);
    }
    if (!topic) {
      res.json({status: 'failed'});
    }
    TopicCollect.remove(req.session.user._id, topic._id, function (err) {
      if (err) {
        return next(err);
      }
      res.json({status: 'success'});
    });

    User.getUserById(req.session.user._id, function (err, user) {
      if (err) {
        return next(err);
      }
      user.collect_topic_count -= 1;
      user.save();
    });

    topic.collect_count -= 1;
    topic.save();

    req.session.user.collect_topic_count -= 1;
  });
};

exports.upload = function (req, res, next) {
  req.busboy.on('file', function (fieldname, file, filename, encoding, mimetype) {
      store.upload(file, {filename: filename}, function (err, result) {
        if (err) {
          return next(err);
        }
        res.json({
          success: true,
          url: result.url,
        });
      });
    });

  req.pipe(req.busboy);
};
