var eventproxy = require('eventproxy');
var TopicProxy   = require('../../proxy').Topic;
var TopicCollectProxy = require('../../proxy').TopicCollect;
var UserProxy = require('../../proxy').User;
var _ = require('lodash');
var validator    = require('validator');

function list(req, res, next) {
  var loginname = req.params.loginname;
  var ep        = new eventproxy();

  ep.fail(next);

  UserProxy.getUserByLoginName(loginname, ep.done(function (user) {
    if (!user) {
      res.status(404);
      return res.send({success: false, error_msg: '用户不存在'});
    }

    // api 返回 100 条就好了
    TopicCollectProxy.getTopicCollectsByUserId(user._id, {limit: 100}, ep.done('collected_topics'));

    ep.all('collected_topics', function (collected_topics) {

      var ids = collected_topics.map(function (doc) {
        return String(doc.topic_id)
      });
      var query = { _id: { '$in': ids } };
      TopicProxy.getTopicsByQuery(query, {}, ep.done('topics', function (topics) {
        topics = _.sortBy(topics, function (topic) {
          return ids.indexOf(String(topic._id))
        });
        return topics
      }));

    });

    ep.all('topics', function (topics) {
      topics = topics.map(function (topic) {
        topic.author = _.pick(topic.author, ['loginname', 'avatar_url']);
        return _.pick(topic, ['id', 'author_id', 'tab', 'content', 'title', 'last_reply_at',
          'good', 'top', 'reply_count', 'visit_count', 'create_at', 'author']);
      });
      res.send({success: true, data: topics})

    })
  }))
}

exports.list = list;

function collect(req, res, next) {
  var topic_id = req.body.topic_id;

  if (!validator.isMongoId(topic_id)) {
    res.status(400);
    return res.send({success: false, error_msg: '不是有效的话题id'});
  }

  TopicProxy.getTopic(topic_id, function (err, topic) {
    if (err) {
      return next(err);
    }
    if (!topic) {
      res.status(404);
      return res.json({success: false, error_msg: '话题不存在'});
    }

    TopicCollectProxy.getTopicCollect(req.user.id, topic._id, function (err, doc) {
      if (err) {
        return next(err);
      }
      if (doc) {
        res.json({success: false});
        return;
      }

      TopicCollectProxy.newAndSave(req.user.id, topic._id, function (err) {
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

      topic.collect_count += 1;
      topic.save();
    });
  });
}

exports.collect = collect;

function de_collect(req, res, next) {
  var topic_id = req.body.topic_id;

  if (!validator.isMongoId(topic_id)) {
    res.status(400);
    return res.send({success: false, error_msg: '不是有效的话题id'});
  }

  TopicProxy.getTopic(topic_id, function (err, topic) {
    if (err) {
      return next(err);
    }
    if (!topic) {
      res.status(404);
      return res.json({success: false, error_msg: '话题不存在'});
    }
    TopicCollectProxy.remove(req.user.id, topic._id, function (err, removeResult) {
      if (err) {
        return next(err);
      }
      if (removeResult.result.n == 0) {
        return res.json({success: false})
      }

      UserProxy.getUserById(req.user.id, function (err, user) {
        if (err) {
          return next(err);
        }
        user.collect_topic_count -= 1;
        user.save();
      });

      topic.collect_count -= 1;
      topic.save();

      res.json({success: true});
    });

  });
}

exports.de_collect = de_collect;
