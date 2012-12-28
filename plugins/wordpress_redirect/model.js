/*jslint node: true, regexp: true, nomen: true, indent: 2, vars: true */

'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
  
var PostToTopicSchema = new Schema({
  _id: { type: Number },
  topic_id: { type: ObjectId }
});

mongoose.model('PostToTopic', PostToTopicSchema);

exports.PostToTopic = mongoose.model('PostToTopic');
