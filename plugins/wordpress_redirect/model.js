var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var PostToTopicSchema = new Schema({
  _id: { type: Number },
  topic_id: { type: ObjectId }
});

mongoose.model('PostToTopic', PostToTopicSchema);

exports.PostToTopic = mongoose.model('PostToTopic');