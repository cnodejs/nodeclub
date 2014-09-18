/*!
 * nodeclub - controllers/topic.js
 */

/**
 * Module dependencies.
 */

var sanitize = require('validator').sanitize;

var at = require('../common/at');
var User = require('../proxy').User;
var Topic = require('../proxy').Topic;
var TopicCollect = require('../proxy').TopicCollect;
var Relation = require('../proxy').Relation;
var EventProxy = require('eventproxy');
var Util = require('../common/util');
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
  var events = ['topic', 'other_topics', 'no_reply_topics', 'relation'];
  var ep = EventProxy.create(events, function (topic, other_topics, no_reply_topics, relation) {
    res.render('topic/index', {
      topic: topic,
      author_other_topics: other_topics,
      no_reply_topics: no_reply_topics,
      relation: relation,
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
    topic.friendly_create_at = Util.format_date(topic.create_at, true);
    topic.friendly_update_at = Util.format_date(topic.update_at, true);

    topic.author = author;

    topic.replies = replies;

    if (!req.session.user) {
      ep.emit('topic', topic);
      ep.emit('relation', null);
    } else {
      TopicCollect.getTopicCollect(req.session.user._id, topic._id, ep.done(function (doc) {
        topic.in_collection = doc;
        ep.emit('topic', topic);
      }));
      Relation.getRelation(req.session.user._id, author._id, ep.done('relation'));
    }

    // get other_topics
    var options = { limit: 5, sort: [
      [ 'last_reply_at', 'desc' ]
    ]};
    var query = { author_id: topic.author_id, _id: { '$nin': [ topic._id ] } };
    Topic.getTopicsByQuery(query, options, ep.done('other_topics'));

    // get no_reply_topics
    var options2 = { limit: 5, sort: [
      ['create_at', 'desc']
    ] };
    Topic.getTopicsByQuery({reply_count: 0}, options2, ep.done('no_reply_topics'));
  }));
};

exports.create = function (req, res, next) {
  res.render('topic/edit', {
    tabs: config.tabs
  });
};

var allTags = config.tabs.map(function (tPair) {
  return tPair[0];
});

exports.put = function (req, res, next) {
  var title = sanitize(req.body.title).trim();
  title = sanitize(title).xss();
  var tab = sanitize(req.body.tab).xss().trim();
  var content = req.body.t_content;

  // 验证
  var editError;
  if (title === '') {
    editError = '标题不能是空的。';
  } else if (title.length < 5 && title.length > 100) {
    editError = '标题字数太多或太少。';
  } else if (!tab || allTags.indexOf(tab) === -1) {
    editError = '必须选择一个版块。';
  }
  // END 验证

  if (editError) {
    res.render('topic/edit', {
      edit_error: editError,
      title: title,
      content: content,
      tabs: config.tabs
    });
  } else {
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
  }
};

exports.showEdit = function (req, res, next) {
  if (!req.session.user) {
    res.redirect('/');
    return;
  }

  var topic_id = req.params.tid;
  if (topic_id.length !== 24) {
    res.render('notify/notify', {error: '此话题不存在或已被删除。'});
    return;
  }
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
  if (!req.session.user) {
    res.redirect('/');
    return;
  }
  var topic_id = req.params.tid;
  if (topic_id.length !== 24) {
    res.render('notify/notify', {error: '此话题不存在或已被删除。'});
    return;
  }

  Topic.getTopicById(topic_id, function (err, topic, tags) {
    if (!topic) {
      res.render('notify/notify', {error: '此话题不存在或已被删除。'});
      return;
    }

    if (String(topic.author_id) === String(req.session.user._id) || req.session.user.is_admin) {
      var title = sanitize(req.body.title).trim();
      title = sanitize(title).xss();
      var tab = sanitize(req.body.tab).xss().trim();
      var content = req.body.t_content;

      // 验证
      var editError;
      if (title === '') {
        editError = '标题不能是空的。';
      } else if (title.length < 5 && title.length > 100) {
        editError = '标题字数太多或太少。';
      } else if (!tab) {
        editError = '必须选择一个版块。';
      }
      // END 验证

      if (editError) {
        res.render('topic/edit', {
          action: 'edit',
          edit_error: editError,
          topic_id: topic._id,
          content: content,
          tabs: config.tabs
        });
      } else {
        //保存话题
        //删除topic_tag，标签topic_count减1
        //保存新topic_tag
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
      }
    } else {
      res.render('notify/notify', {error: '对不起，你不能编辑此话题。'});
    }
  });
};

exports.delete = function (req, res, next) {
  //删除话题, 话题作者topic_count减1
  //删除回复，回复作者reply_count减1
  //删除topic_tag，标签topic_count减1
  //删除topic_collect，用户collect_topic_count减1
  if (!req.session.user) {
    return res.send({success: false, message: '无权限'});
  }
  var topic_id = req.params.tid;
  if (topic_id.length !== 24) {
    return res.send({ success: false, error: '此话题不存在或已被删除。' });
  }
  Topic.getTopic(topic_id, function (err, topic) {
    if (err) {
      return res.send({ success: false, message: err.message });
    }
    if( !req.session.user.is_admin && !(topic.author_id.equals(req.session.user._id))){
      return res.send({success: false, message: '无权限'});
    }
    if (!topic) {
      return res.send({ success: false, message: '此话题不存在或已被删除。' });
    }
    topic.remove(function (err) {
      if (err) {
        return res.send({ success: false, message: err.message });
      }
      res.send({ success: true, message: '话题已被删除。' });
    });
  });
};

exports.top = function (req, res, next) {
  var topic_id = req.params.tid;
  var is_top = req.params.is_top;
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
    topic.top = is_top;
    topic.save(function (err) {
      if (err) {
        return next(err);
      }
      var msg = topic.top ? '此话题已经被置顶。' : '此话题已经被取消置顶。';
      res.render('notify/notify', {success: msg});
    });
  });
};

exports.good = function (req, res, next) {
  var topicId = req.params.tid;
  var isGood = req.params.is_good;
  Topic.getTopic(topicId, function (err, topic) {
    if (err) {
      return next(err);
    }
    if (!topic) {
      res.render('notify/notify', {error: '此话题不存在或已被删除。'});
      return;
    }
    topic.good = isGood;
    topic.save(function (err) {
      if (err) {
        return next(err);
      }
      var msg = topic.good ? '此话题已加精。' : '此话题已经取消加精。';
      res.render('notify/notify', {success: msg});
    });
  });
};

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
