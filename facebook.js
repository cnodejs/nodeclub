/*jslint indent: 2, node: true, vars: true, nomen: true */

'use strict';

var fbGroupSync = require('facebook-group-sync');
var models = require('./models');
var Topic = models.Topic;
var User = models.User;
var config = require('./config').config;

fbGroupSync.setConfig({
  clientId: config.facebook.api_key,
  clientSecret: config.facebook.secret,
  groupId: '262800543746083',
  //accessToken: '', // 可以不給，程式會自己取得
  frequency: 10000 // 預設是 3600000 (一小時)
});

function run(user) {
  fbGroupSync(function (posts) {
    posts.forEach(function (post) {
      var topic = new Topic();
      var title;
      var message;
     
      if (post.message) {
        title = post.message.length > 46 ? post.message.substr(0, 43) + '...' : post.message;
        message = post.message;
      }

      if (post.story) {
        title = post.story.length > 46 ? post.story.substr(0, 43) + '...' : post.story;
        message = post.story;
      }

      if (post.type === 'link') {
        message = '<a href="' + post.link + '">' + post.description + '</a>' + message;
      }
      
      topic.title = title;
      topic.author_id = user._id;
      topic.content = message;
      topic.last_reply_at = topic.create_at = new Date(post.created_time);
      topic.update_at = new Date(post.updated_time);
      topic.facebook_id = post.id;

      topic.save(function (err, topic) {
        if (err) {
          throw err;
        }
        console.log('Save ' + topic._id);
      });
    });
  });
}

User.findOne({loginname: 'fbgroup'}, function (err, user) {
  if (err) {
    throw err;
  }
  if (!user) {
    user = new User();
    user.name = 'FacebookGroup';
    user.loginname = 'fbgroup';
    user.pass = '=====';
    user.profile_image_url = 'http://www.gravatar.com/avatar/884821923470e57e3bebb2959e2ac1c8?size=48';
    user.save(function (err, user) {
      if (err) {
        throw err;
      }
      run(user);
    });
    return;
  }
  run(user);
});


