var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var TopicCollectSchema = new Schema({
  user_id: { type: ObjectId },
  topic_id: { type: ObjectId },
  create_at: { type: Date, default: Date.now }
});

mongoose.model('TopicCollect', TopicCollectSchema);
