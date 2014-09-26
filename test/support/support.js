var User = require('../../proxy/user');
var Topic = require('../../proxy/topic');
var ready = require('ready');
var eventproxy = require('eventproxy');

function randomInt() {
  return (Math.random() * 10000).toFixed(0);
}

var createUser = exports.createUser = function (callback) {
  var key = new Date().getTime() + '_' + randomInt();
  User.newAndSave('jackson' + key, 'jackson' + key, 'pass', 'jackson' + key + '@domain.com', '', false, callback);
};

var createTopic = exports.createTopic = function (authorId, callback) {
  var key = new Date().getTime() + '_' + randomInt();
  Topic.newAndSave('title' + key, 'content' + key, 'share', authorId, callback);
};

function mockUser(user) {
  return 'mock_user=' + JSON.stringify(user) + ';';
}

exports.normalUserCookie = mockUser({});

ready(exports);

var ep = new eventproxy();
ep.fail(function (err) {
  console.error(err);
});

ep.all('user', 'user2', function (user, user2) {
  exports.normalUserCookie = mockUser(user);
  exports.normalUser2Cookie = mockUser(user2);

  createTopic(user._id, ep.done('topic'));
});
createUser(ep.done('user'));
createUser(ep.done('user2'));

ep.all('topic', function (topic) {
  exports.testTopic = topic;
  exports.ready(true);
});



