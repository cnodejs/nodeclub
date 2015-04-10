var _ = require('lodash');
var eventproxy = require('eventproxy');
var UserProxy = require('../../proxy').User;
var TopicProxy = require('../../proxy').Topic;
var ReplyProxy = require('../../proxy').Reply;
var TopicCollect = require('../../proxy').TopicCollect;

var show = function (req, res, next) {
  var loginname = req.params.loginname;

  var ep = new eventproxy();
  ep.fail(next);

  UserProxy.getUserByLoginName(loginname, ep.done(function (user) {
    if (!user) {
      return res.send({error_msg: 'user `' + loginname + '` is not exists'});
    }
    var query = {author_id: user._id};
    var opt = {limit: 5, sort: '-create_at'};
    TopicProxy.getTopicsByQuery(query, opt, ep.done('recent_topics'));

    ReplyProxy.getRepliesByAuthorId(user._id, {limit: 20, sort: '-create_at'},
      ep.done(function (replies) {
        var topic_ids = [];
        for (var i = 0; i < replies.length; i++) {
          if (topic_ids.indexOf(replies[i].topic_id.toString()) < 0) {
            topic_ids.push(replies[i].topic_id.toString());
          }
        }
        var query = {_id: {'$in': topic_ids}};
        var opt = {limit: 5, sort: '-create_at'};
        TopicProxy.getTopicsByQuery(query, opt, ep.done('recent_replies'));
      }));

    TopicCollect.getTopicCollectsByUserId(user._id,
      ep.done(function (collections) {
        var topic_ids = [];
        for (var i = 0; i < collections.length; i++) {
          if (topic_ids.indexOf(collections[i].topic_id.toString()) < 0) {
            topic_ids.push(collections[i].topic_id.toString());
          }
        }
        var query = {_id: {'$in': topic_ids}};
        var opt = {sort: '-create_at'};
        TopicProxy.getTopicsByQuery(query, opt, ep.done('collect_topics'));
      }));
    ep.all('recent_topics', 'recent_replies', 'collect_topics',
      function (recent_topics, recent_replies, collect_topics) {

        user = _.pick(user, ['loginname', 'avatar_url', 'githubUsername',
          'create_at', 'score']);

        user.recent_topics = recent_topics.map(function (topic) {
          topic.author = _.pick(topic.author, ['loginname', 'avatar_url']);
          topic = _.pick(topic, ['id', 'author', 'title', 'last_reply_at']);
          return topic;
        });
        user.recent_replies = recent_replies.map(function (topic) {
          topic.author = _.pick(topic.author, ['loginname', 'avatar_url']);
          topic = _.pick(topic, ['id', 'author', 'title', 'last_reply_at']);
          return topic;
        });
        user.collect_topics = collect_topics.map(function (topic) {
          topic.author = _.pick(topic.author, ['loginname', 'avatar_url']);
          topic = _.pick(topic, ['id', 'author', 'title', 'last_reply_at']);
          return topic;
        });

        res.send({data: user});
      });
  }));
};

exports.show = show;
