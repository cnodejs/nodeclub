/*!
 * Sync post id to topic by title.
 * 
 * Usage: node sync_post_id_to_topic.js wordpress.json
 * 
 * Copyright(c) 2012 fengmk2 <fengmk2@gmail.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var PostToTopic = require('./model').PostToTopic;
var Topic = require('../../models').Topic;
var path = require('path');

var posts = require(path.join(process.cwd(), process.argv[2]));

function sync(post, callback) {
  var title = post.post_title;
  if (!title || post.post_type !== 'post') {
    return callback();
  }
  Topic.findOne({ title: title }, function (err, topic) {
    if (err) {
      return callback(err);
    }
    if (!topic) {
      // console.log('%s %s not found', post.id, title);
      return callback();
    }
    var r = new PostToTopic();
    r._id = post.id;
    r.topic_id = topic._id;
    r.save();
    console.log('%s %s founed %s', post.id, title, topic._id);
    callback();
  });
}

function next(i) {
  var post = posts[i];
  if (!post) {
    process.exit(0);
  }
  sync(post, function (err) {
    if (err) {
      throw err;
    }
    next(--i);
  });
}

next(posts.length - 1);
