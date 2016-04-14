var _            = require('lodash');
var eventproxy   = require('eventproxy');
var UserProxy    = require('../../proxy').User;
var TopicProxy   = require('../../proxy').Topic;
var ReplyProxy   = require('../../proxy').Reply;
var TopicCollect = require('../../proxy').TopicCollect;

var show = function (req, res, next) {
  var loginname = req.params.loginname;
  var ep        = new eventproxy();

  ep.fail(next);

  UserProxy.getUserByLoginName(loginname, ep.done(function (user) {
    if (!user) {
      res.status(404);
      return res.send({success: false, error_msg: '用户不存在'});
    }
    var query = {author_id: user._id};
    var opt = {limit: 15, sort: '-create_at'};
    TopicProxy.getTopicsByQuery(query, opt, ep.done('recent_topics'));

    ReplyProxy.getRepliesByAuthorId(user._id, {limit: 20, sort: '-create_at'},
      ep.done(function (replies) {
        var topic_ids = replies.map(function (reply) {
          return reply.topic_id.toString()
        });
        topic_ids = _.uniq(topic_ids).slice(0, 5); //  只显示最近5条

        var query = {_id: {'$in': topic_ids}};
        var opt = {};
        TopicProxy.getTopicsByQuery(query, opt, ep.done('recent_replies', function (recent_replies) {
          recent_replies = _.sortBy(recent_replies, function (topic) {
            return topic_ids.indexOf(topic._id.toString())
          });
          return recent_replies;
        }));
      }));

    ep.all('recent_topics', 'recent_replies',
      function (recent_topics, recent_replies) {

        user = _.pick(user, ['loginname', 'avatar_url', 'githubUsername',
          'create_at', 'score']);

        user.recent_topics = recent_topics.map(function (topic) {
          topic.author = _.pick(topic.author, ['loginname', 'avatar_url']);
          topic        = _.pick(topic, ['id', 'author', 'title', 'last_reply_at']);
          return topic;
        });
        user.recent_replies = recent_replies.map(function (topic) {
          topic.author = _.pick(topic.author, ['loginname', 'avatar_url']);
          topic        = _.pick(topic, ['id', 'author', 'title', 'last_reply_at']);
          return topic;
        });

        res.send({success: true, data: user});
      });
  }));
};

exports.show = show;
