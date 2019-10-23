var UserModel = require('../models').User;
var TopicModel = require('../models').Topic

// usage:
// node get_user_topics.js alsotang
UserModel.findOne({
  loginname: process.argv[2]
}, function (err, user) {
  TopicModel.find({
    author_id: user._id
  }, function (err, topics) {
    console.log(topics)
  })
})