var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TagSchema = new Schema({
  name: { type: String },
  order: { type: Number, default: 1 },
  description: { type: String },
  background: { type: String },
  topic_count: { type: Number, default: 0 },
  collect_count: { type: Number, default: 0 },
  create_at: { type: Date, default: Date.now }
});

mongoose.model('Tag', TagSchema);
