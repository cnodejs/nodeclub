var TopicCollect = require('../models').TopicCollect;
var UserModel = require('../models').User;
var TopicModel = require('../models').Topic

// 修复用户的topic_collect计数
TopicCollect.aggregate(
  [{
    "$group" :
      {
        _id : {user_id: "$user_id"},
        count : { $sum : 1}
      }
  }], function (err, result) {
    result.forEach(function (row) {
      var userId = row._id.user_id;
      var count = row.count;

      UserModel.findOne({
        _id: userId
      }, function (err, user) {

        if (!user) {
          return;
        }

        user.collect_topic_count = count;
        user.save(function () {
          console.log(user.loginname, count)
        });
      })
    })
  })

  // 修复帖子的topic_collect计数
  TopicCollect.aggregate(
    [{
      "$group" :
        {
          _id : {topic_id: "$topic_id"},
          count : { $sum : 1}
        }
    }], function (err, result) {
      result.forEach(function (row) {
        var topic_id = row._id.topic_id;
        var count = row.count;

        TopicModel.findOne({
          _id: topic_id
        }, function (err, topic) {

          if (!topic) {
            return;
          }

          topic.collect_topic_count = count;
          topic.save(function () {
            console.log(topic.id, count)
          });
        })
      })
    })
