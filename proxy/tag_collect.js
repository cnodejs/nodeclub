var models = require('../models');
var TagCollect = models.TagCollect;

exports.newAndSave = function (userId, tagId, callback) {
  var tag_collect = new TagCollect();
  tag_collect.user_id = userId;
  tag_collect.tag_id = tagId;
  tag_collect.save(callback);
};

exports.getTagCollect = function (userId, tagId, callback) {
  TagCollect.findOne({user_id: userId, tag_id: tagId}, callback);
};

exports.getTagCollectsByUserId = function (userId, callback) {
  TagCollect.find({user_id: userId}, callback);
};

exports.remove = function (userId, tagId, callback) {
  TagCollect.remove({user_id: userId, tag_id: tagId}, callback);
};

exports.removeAllByTagId = function (tagId, callback) {
  TagCollect.remove({tag_id: tagId}, callback);
};

