var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	ObjectId = Schema.ObjectId;
	
var TopicSchema = new Schema({
	title: { type: String },
	content: { type: String },
	author_id: { type: ObjectId },
	reply_count: { type: Number, default: 0 },
	visit_count: { type: Number, default: 0 },
	collect_count: { type: Number, default: 0 },
	create_at: { type: Date, default: Date.now },
	update_at: { type: Date, default: Date.now },
	last_reply: { type: ObjectId },
	last_reply_at: { type: Date, default: Date.now },
	content_is_html: { type: Boolean }
});

mongoose.model('Topic', TopicSchema);
