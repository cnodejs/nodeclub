var models       = require('../../models');
var TopicModel   = models.Topic;
var TopicProxy   = require('../../proxy').Topic;
var TopicCollect = require('../../proxy').TopicCollect;
var UserProxy    = require('../../proxy').User;
var UserModel    = models.User;
var config       = require('../../config');
var eventproxy   = require('eventproxy');
var _            = require('lodash');
var at           = require('../../common/at');
var renderHelper = require('../../common/render_helper');
var validator    = require('validator');

var index = function (req, res, next) {
  var page     = parseInt(req.query.page, 10) || 1;
  page         = page > 0 ? page : 1;
  var tab      = req.query.tab || 'all';
  var limit    = Number(req.query.limit) || config.list_topic_count;
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

      res.send({success: true, data: topics});
    });
  });
};

exports.index = index;

var show = function (req, res, next) {
  var topicId  = String(req.params.id);

  var mdrender = req.query.mdrender === 'false' ? false : true;
  var ep       = new eventproxy();

  if (!validator.isMongoId(topicId)) {
    res.status(400);
    return res.send({success: false, error_msg: '不是有效的话题id'});
  }

  ep.fail(next);

  TopicProxy.getFullTopic(topicId, ep.done(function (msg, topic, author, replies) {
    if (!topic) {
      res.status(404);
      return res.send({success: false, error_msg: '话题不存在'});
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
      reply =  _.pick(reply, ['id', 'author', 'content', 'ups', 'create_at', 'reply_id']);
      reply.reply_id = reply.reply_id || null;
      return reply;
    });

    ep.emit('full_topic', topic)
  }));


  if (!req.user) {
    ep.emitLater('is_collect', null)
  } else {
    TopicCollect.getTopicCollect(req.user._id, topicId, ep.done('is_collect'))
  }

  ep.all('full_topic', 'is_collect', function (full_topic, is_collect) {
    full_topic.is_collect = !!is_collect;

    res.send({success: true, data: full_topic});
  })

};

exports.show = show;

var create = function (req, res, next) {
  var title   = validator.trim(req.body.title || '');
  var tab     = validator.trim(req.body.tab || '');
  var content = validator.trim(req.body.content || '');

  // 得到所有的 tab, e.g. ['ask', 'share', ..]
  var allTabs = config.tabs.map(function (tPair) {
    return tPair[0];
  });

  // 验证
  var editError;
  if (title === '') {
    editError = '标题不能为空';
  } else if (title.length < 5 || title.length > 100) {
    editError = '标题字数太多或太少';
  } else if (!tab || !_.includes(allTabs, tab)) {
    editError = '必须选择一个版块';
  } else if (content === '') {
    editError = '内容不可为空';
  }
  // END 验证

  if (editError) {
    res.status(400);
    return res.send({success: false, error_msg: editError});
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
        topic_id: topic.id
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

exports.update = function (req, res, next) {
  var topic_id = _.trim(req.body.topic_id);
  var title    = _.trim(req.body.title);
  var tab      = _.trim(req.body.tab);
  var content  = _.trim(req.body.content);

  // 得到所有的 tab, e.g. ['ask', 'share', ..]
  var allTabs = config.tabs.map(function (tPair) {
    return tPair[0];
  });

  TopicProxy.getTopicById(topic_id, function (err, topic, tags) {
    if (!topic) {
      res.status(400);
      return res.send({success: false, error_msg: '此话题不存在或已被删除。'});
    }

    if (topic.author_id.equals(req.user._id) || req.user.is_admin) {
      // 验证
      var editError;
      if (title === '') {
        editError = '标题不能是空的。';
      } else if (title.length < 5 || title.length > 100) {
        editError = '标题字数太多或太少。';
      } else if (!tab || !_.includes(allTabs, tab)) {
        editError = '必须选择一个版块。';
      }
      // END 验证

      if (editError) {
        return res.send({success: false, error_msg: editError});
      }

      //保存话题
      topic.title     = title;
      topic.content   = content;
      topic.tab       = tab;
      topic.update_at = new Date();

      topic.save(function (err) {
        if (err) {
          return next(err);
        }
        //发送at消息
        at.sendMessageToMentionUsers(content, topic._id, req.user._id);

        res.send({
          success: true,
          topic_id: topic.id
        });
      });
    } else {
      res.status(403)
      return res.send({success: false, error_msg: '对不起，你不能编辑此话题。'});
    }
  });
};

