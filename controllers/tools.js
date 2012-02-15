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
