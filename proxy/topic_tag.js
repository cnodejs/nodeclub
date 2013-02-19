var TopicTag = require('../models').TopicTag;

exports.getTopicTagByTagId = function (tagId, callback) {
  TopicTag.find({tag_id: tagId}, callback);
};

exports.getTopicTagByTopicId = function (topicId, callback) {
  TopicTag.find({topic_id: topicId}, callback);
};

exports.removeByTagId = function (tagId, callback) {
  TopicTag.remove({tag_id: tagId}, callback);
};

exports.newAndSave = function (topicId, tagId, callback) {
  var topic_tag = new TopicTag();
  topic_tag.topic_id = topicId;
  topic_tag.tag_id = tagId;
  topic_tag.save(callback);
};

