var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
	
var ReplySchema = new Schema({
	content: { type: String },
	topic_id: { type: ObjectId, index: true },
	author_id: { type: ObjectId },
	reply_id : { type: ObjectId },
	create_at: { type: Date, default: Date.now },
	update_at: { type: Date, default: Date.now },
	content_is_html: { type: Boolean }
});

mongoose.model('Reply', ReplySchema);
