var models = require('../../models');
var TopicModel = models.Topic;
var TopicProxy = require('../../proxy').Topic;
var TopicCollect = require('../../proxy').TopicCollect;
var UserProxy = require('../../proxy').User;
var UserModel = models.User;
var config = require('../../config');
var eventproxy = require('eventproxy');
var _ = require('lodash');
var at = require('../../common/at');
var renderHelper = require('../../common/render_helper');
var validator = require('validator');

var index = function (req, res, next) {
  var page = parseInt(req.query.page, 10) || 1;
  page = page > 0 ? page : 1;
  var tab = req.query.tab || 'all';
  var limit = Number(req.query.limit) || config.list_topic_count;
  var mdrender = req.query.mdrender === 'false' ? false : true;

  var query = {};
  if (tab && tab !== 'all') {
    if (tab === 'good') {
      query.good = true;
    } else {
      query.tab = tab;
    }
  }
  query.deleted = false;
  var options = { skip: (page - 1) * limit, limit: limit, sort: '-top -last_reply_at'};

  var ep = new eventproxy();
  ep.fail(next);

  TopicModel.find(query, '', options, ep.done('topics'));

  ep.all('topics', function (topics) {
    topics.forEach(function (topic) {
      UserModel.findById(topic.author_id, ep.done(function (author) {
        if (mdrender) {
          topic.content = renderHelper.markdown(at.linkUsers(topic.content));
        }
        topic.author = _.pick(author, ['loginname', 'avatar_url']);
        ep.emit('author');
      }));
    });

    ep.after('author', topics.length, function () {
      topics = topics.map(function (topic) {
        return _.pick(topic, ['id', 'author_id', 'tab', 'content', 'title', 'last_reply_at',
          'good', 'top', 'reply_count', 'visit_count', 'create_at', 'author']);
      });

      res.send({data: topics});
    });
  });
};

exports.index = index;

var show = function (req, res, next) {
  var topicId = req.params.id;
  var mdrender = req.query.mdrender === 'false' ? false : true;

  var ep = new eventproxy();
  ep.fail(next);

  TopicProxy.getFullTopic(topicId, ep.done(function (msg, topic, author, replies) {
    if (!topic) {
      return res.send({error_msg: 'topic_id `' + topicId + '` is not exists.'});
    }
    topic = _.pick(topic, ['id', 'author_id', 'tab', 'content', 'title', 'last_reply_at',
      'good', 'top', 'reply_count', 'visit_count', 'create_at', 'author']);

    if (mdrender) {
      topic.content = renderHelper.markdown(at.linkUsers(topic.content));
    }
    topic.author = _.pick(author, ['loginname', 'avatar_url']);

    topic.replies = replies.map(function (reply) {
      if (mdrender) {
        reply.content = renderHelper.markdown(at.linkUsers(reply.content));
      }
      reply.author = _.pick(reply.author, ['loginname', 'avatar_url']);
      reply =  _.pick(reply, ['id', 'author', 'content', 'ups', 'create_at']);
      return reply;
    });
    res.send({data: topic});
  }));
};

exports.show = show;

var create = function (req, res, next) {
  var title = validator.trim(req.body.title);
  title = validator.escape(title);
  var tab = validator.trim(req.body.tab);
  tab = validator.escape(tab);
  var content = validator.trim(req.body.content);

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
    return res.send({
      error_msg: editError,
    });
  }

  TopicProxy.newAndSave(title, content, tab, req.user.id, function (err, topic) {
    if (err) {
      return next(err);
    }

    var proxy = new eventproxy();
    proxy.fail(next);

    proxy.all('score_saved', function () {
      res.send({
        success: true,
        topic_id: topic.id,
      });
    });
    UserProxy.getUserById(req.user.id, proxy.done(function (user) {
      user.score += 5;
      user.topic_count += 1;
      user.save();
      req.user = user;
      proxy.emit('score_saved');
    }));

    //发送at消息
    at.sendMessageToMentionUsers(content, topic.id, req.user.id);
  });
};

exports.create = create;

exports.collect = function (req, res, next) {
  var topic_id = req.body.topic_id;
  TopicProxy.getTopic(topic_id, function (err, topic) {
    if (err) {
      return next(err);
    }
    if (!topic) {
      return res.json({error_msg: '主题不存在'});
    }

    TopicCollect.getTopicCollect(req.user.id, topic._id, function (err, doc) {
      if (err) {
        return next(err);
      }
      if (doc) {
        res.json({success: true});
        return;
      }

      TopicCollect.newAndSave(req.user.id, topic._id, function (err) {
        if (err) {
          return next(err);
        }
        res.json({success: true});
      });
      UserProxy.getUserById(req.user.id, function (err, user) {
        if (err) {
          return next(err);
        }
        user.collect_topic_count += 1;
        user.save();
      });

      req.user.collect_topic_count += 1;
      topic.collect_count += 1;
      topic.save();
    });
  });
};

exports.de_collect = function (req, res, next) {
  var topic_id = req.body.topic_id;
  TopicProxy.getTopic(topic_id, function (err, topic) {
    if (err) {
      return next(err);
    }
    if (!topic) {
      return res.json({error_msg: '主题不存在'});
    }
    TopicCollect.remove(req.user.id, topic._id, function (err) {
      if (err) {
        return next(err);
      }
      res.json({success: true});
    });

    UserProxy.getUserById(req.user.id, function (err, user) {
      if (err) {
        return next(err);
      }
      user.collect_topic_count -= 1;
      user.save();
    });

    topic.collect_count -= 1;
    topic.save();

    req.user.collect_topic_count -= 1;
  });
};
