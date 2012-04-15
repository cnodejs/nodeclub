var models = require('../models'),
	User = models.User,
	Topic = models.Topic,
	Reply = models.Reply,
	Relation = models.Relation,
	Message = models.Message;

var EventProxy = require('eventproxy').EventProxy;

exports.run_site_tools = function(req,res,next){
	res.send('<h3>The White Castle</h3>');
};

// exports.reset_data = function(req,res,next){
// 	Topic.find({},function(err,topics){
// 		for(var i=0; i<topics.length; i++){
// 			var topic = topics[i];
// 			if(topic){
// 				topic.reply_count = 0;
// 				topic.save();
// 			}
// 		}
// 	});	
// 	res.end('end');
// };

// exports.cal_data = function(req,res,next){
// 	Reply.find({},function(err,replies){
// 		for(var i=0; i<replies.length; i++){
// 			var reply = replies[i];
// 			if(reply.topic_id){
// 				Topic.update({_id:reply.topic_id},{$inc:{reply_count:1}}).exec();	
// 			}
// 		}
// 	});
// 	res.end('end');
// };
