var User = require('../../proxy/user');
var Tag = require('../../proxy/tag');
var Topic = require('../../proxy/topic');


function randomInt() {
  return (Math.random() * 10000).toFixed(0);
}

exports.createUser = function (callback) {
  var key = new Date().getTime() + '_' + randomInt();
  User.newAndSave('jackson' + key, 'jackson' + key, 'pass', 'jackson' + key + '@domain.com', '', false, callback);
};

exports.createTopic = function (authorId, callback) {
  var key = new Date().getTime() + '_' + randomInt();
  Topic.newAndSave('title' + key, 'content' + key, authorId, callback);
};

exports.createTag = function (callback) {
  var key = new Date().getTime() + '_' + randomInt();
  Tag.newAndSave('name' + key, 'background' + key, 1, 'description' + key, callback);
};
