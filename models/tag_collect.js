var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	ObjectId = Schema.ObjectId;
	
var TagCollectSchema = new Schema({
	user_id: {type: ObjectId, index:true},
	tag_id: {type: ObjectId},
	create_at: {type: Date, default: Date.now}
});

mongoose.model('TagCollect', TagCollectSchema);
