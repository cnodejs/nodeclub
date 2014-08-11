var models = require('../models');
var Relation = models.Relation;

/**
 * 查找用户关系
 * @param {ID} userId 用户id
 * @param {ID} targetId 关系人的id
 */
exports.getRelation = function (userId, targetId, callback) {
  Relation.findOne({user_id: userId, $or: [{follow_id: targetId}, {block_id: targetId}]}, callback);
};

/**
 * 查找关注关系
 * @param {ID} userId 用户id
 * @param {ID} followId 被关注人的id
 */
exports.getFollowRelation = function (userId, followId, callback) {
  Relation.findOne({user_id: userId, follow_id: followId}, callback);
};

/**
 * 查找屏蔽关系
 * @param {ID} userId 用户id
 * @param {ID} blockId 被屏蔽人的id
 */
exports.getBlockRelation = function (userId, blockId, callback) {
  Relation.findOne({user_id: userId, block_id: blockId}, callback);
};

/**
 * 根据用户查找粉丝们
 * @param {ID} userId
 */
exports.getFollowers = function (userId, callback) {
  Relation.find({follow_id: userId}, callback);
};

/**
 * 根据用户查找用户的偶像们
 * @param {ID} userId
 */
exports.getFollowings = function (userId, callback) {
  Relation.find({user_id: userId, follow_id: {$exists: true}}, callback);
};

/**
 * 根据用户查找用户屏蔽的人
 */
exports.getBlockings = function(userId, callback) {
  Relation.find({user_id: userId, block_id: {$exists: true}}, callback);
};

/**
 * 创建新的关注关系
 * @param {ID} userId 用户id
 * @param {ID} followId 被关注人的id
 */
exports.newAndSaveFollowRelation = function (userId, followId, callback) {
  var relation = new Relation();
  relation.user_id = userId;
  relation.follow_id = followId;
  relation.save(callback);
};

/**
 * 创建新的屏蔽关系
 * @param {ID} userId 用户id
 * @param {ID} blockId 被屏蔽人的id
 */
exports.newAndSaveBlockRelation = function (userId, blockId, callback) {
  var relation = new Relation();
  relation.user_id = userId;
  relation.block_id = blockId;
  relation.save(callback);
};

/**
 * 删除用户关系
 * @param {ID} userId 用户id
 * @param {ID} targetId 关系人的id
 */
exports.remove = function (userId, targetId, callback) {
  Relation.remove({user_id: userId, $or: [{follow_id: targetId}, {block_id: targetId}]}, callback);
};
