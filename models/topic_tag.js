var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var TopicTagSchema = new Schema({
  topic_id: { type: ObjectId },
  tag_id: { type: ObjectId },
  create_at: { type: Date, default: Date.now }
});

mongoose.model('TopicTag', TopicTagSchema);
