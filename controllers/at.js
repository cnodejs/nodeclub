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
var EventProxy = require('eventproxy').EventProxy;


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

function sendMessageToMentionUsers(text, topicId, authorId, callback) {
  exports.searchUsers(text, function (err, users) {
    if (err || !users || users.length === 0) {
      return callback && callback(err);
    }
    var ep = EventProxy.create();
    ep.after('sent', users.length, function () {
      callback && callback();
    });
    ep.once('error', function (err) {
      ep.unbind();
      callback && callback(err);
    });
    users.forEach(function (user) {
      Message.send_at_message(user._id, authorId, topicId, function (err) {
        if (err) {
          return ep.emit('error', err);
        }
        ep.emit('sent');
      });
    });
  }); 
}

function linkUsers(text, callback) {
  exports.searchUsers(text, function (err, users) {
    if (err) {
      return callback(err);
    }
    for (var i = 0, l = users.length; i < l; i++) {
      var name = users[i].name;
      text = text.replace(new RegExp('@' + name, 'gmi'), '@<a href="/user/' + name + '">' + name + '</a>');
    }
    return callback(err, text);
  });
}

exports.searchUsers = searchUsers;
exports.send_at_message = exports.sendMessageToMentionUsers = sendMessageToMentionUsers;
exports.link_at_who = exports.linkUsers = linkUsers;
