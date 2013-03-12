var models = require('../models');
var Relation = models.Relation;

exports.getRelation = function (userId, followId, callback) {
  Relation.findOne({user_id: userId, follow_id: followId}, callback);
};

exports.getRelationsByUserId = function (id, callback) {
  Relation.find({follow_id: id}, callback);
};

exports.getFollowings = function (userId, callback) {
  Relation.find({ user_id: userId }, callback);
};

exports.newAndSave = function (userId, followId, callback) {
  var relation = new Relation();
  relation.user_id = userId;
  relation.follow_id = followId;
  relation.save(callback);
};

exports.remove = function (userId, followId, callback) {
  Relation.remove({user_id: userId, follow_id: followId}, callback);
};
