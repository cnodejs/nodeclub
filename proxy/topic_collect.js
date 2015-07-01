var TopicCollect = require('../models').TopicCollect;

exports.getTopicCollect = function (userId, topicId, callback) {
  TopicCollect.findOne({user_id: userId, topic_id: topicId}, callback);
};

exports.getTopicCollectsByUserId = function (userId, callback) {
  TopicCollect.find({user_id: userId}, callback);
};

exports.newAndSave = function (userId, topicId, callback) {
  var topic_collect = new TopicCollect();
  topic_collect.user_id = userId;
  topic_collect.topic_id = topicId;
  topic_collect.save(callback);
};

exports.remove = function (userId, topicId, callback) {
  TopicCollect.remove({user_id: userId, topic_id: topicId}, callback);
};

