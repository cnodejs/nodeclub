/*!
 * nodeclub - topic mention user controller.
 * Copyright(c) 2012 fengmk2 <fengmk2@gmail.com>
 * Copyright(c) 2012 muyuan
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var models = require('../models');
var User = models.User;
var Message = require('./message');
var EventProxy = require('eventproxy');

function searchUsers(text, callback) {
  var results = text.match(/@[a-zA-Z0-9]+/ig);
  var names = [];
  if (results) {
    for (var i = 0, l = results.length; i < l; i++) {
      var s = results[i];
      //remove char @
      s = s.slice(1);
      names.push(s);
    }
  }
  if (names.length === 0) {
    return callback(null, names);
  }

  User.find({ name: { $in: names } }, callback);
}

exports.sendMessageToMentionUsers = function (text, topicId, authorId, callback) {
  callback = callback || function () {};
  searchUsers(text, function (err, users) {
    if (err || !users || users.length === 0) {
      return callback(err);
    }
    var ep = EventProxy.create();
    ep.after('sent', users.length, function () {
      callback();
    });
    ep.fail(callback);
    users.forEach(function (user) {
      Message.sendAtMessage(user._id, authorId, topicId, ep.done('sent'));
    });
  });
};

exports.linkUsers = function (text, callback) {
  searchUsers(text, function (err, users) {
    if (err) {
      return callback(err);
    }
    for (var i = 0, l = users.length; i < l; i++) {
      var name = users[i].name;
      text = text.replace(new RegExp('@' + name, 'gmi'), '@[' + name + '](/user/' + name + ')');
    }
    return callback(null, text);
  });
};
