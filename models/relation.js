var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	ObjectId = Schema.ObjectId;
	
var RelationSchema = new Schema({
	user_id: {type: ObjectId},
	follow_id: {type: ObjectId},
	create_at: {type: Date, default: Date.now}
});

mongoose.model('Relation', RelationSchema);
