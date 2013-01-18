/*jslint indent: 2, node: true, vars: true, nomen: true */

'use strict';

var fbGroupSync = require('facebook-group-sync');
var models = require('./models');
var Topic = models.Topic;
var User = models.User;

fbGroupSync.setConfig({
  clientId: '393020914114844',
  clientSecret: '1c7c96dbb4416f37d53a642b6de52892',
  groupId: 'node.js.tw',
  accessToken: '393020914114844|dIX28XdQz3rrd_GDvafcN3fhz_w', // 可以不給，程式會自己取得
  frequency: 1000 // 預設是 3600000 (一小時)
});

function run(user) {
  fbGroupSync(function (posts) {
    posts.forEach(function (post) {
      var topic = new Topic();
      var title;
      var message;
     
      if (post.message) {
        title = post.message.length > 13 ? post.message.substr(0, 13) + '...' : post.message;
        message = post.message;
      }

      if (post.story) {
        title = post.story.length > 13 ? post.story.substr(0, 13) + '...' : post.story;
        message = post.story;
      }

      if (post.type === 'link') {
        message = '<a href="' + post.link + '">' + post.description + '</a>' + message;
      }
      
      topic.title = title;
      topic.author_id = user._id;
      topic.content = message;
      topic.created_at = post.created_time;
      topic.update_at = post.update_time;
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


