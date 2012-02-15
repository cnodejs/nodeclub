var models = require('../models'),
	User = models.User,
	Message = models.Message;

var user_ctrl = require('./user');
var message_ctrl = require('./message');
var EventProxy = require('eventproxy').EventProxy;

function search_at_who(str,cb){
	var pattern = /@[a-zA-Z0-9]+/ig;
	var results = str.match(pattern);
	var names = [];

	if(results){
		for(var i=0; i<results.length; i++){
			var s = results[i];
			//remove char @
			s = s.slice(1);
			names.push(s);
		}
	}
	
	if(names.length == 0){
		return cb(null,names);
	}

	var users = [];
	var proxy = new EventProxy();
	var done = function(){
		return cb(null,users);
	}
	proxy.after('user_found',names.length,done);
	for(var i=0; i<names.length; i++){
		var name = names[i];
		var loginname = name.toLowerCase();	
		user_ctrl.get_user_by_loginname(loginname,function(err,user){
			if(err) return cb(err);
			if(user){
				users.push(user);
				proxy.trigger('user_found');
			}else{
				proxy.trigger('user_found');
			}
		});
	}
}

function send_at_message(str,topic_id,author_id){
	search_at_who(str,function(err,users){
		for(var i=0; i<users.length; i++){
			var user = users[i];
			message_ctrl.send_at_message(user._id,author_id,topic_id);
		}
	});	
}

function link_at_who(str,cb){
	search_at_who(str,function(err,users){
		if(err) return cb(err);
		for(var i=0; i<users.length; i++){
			var name = users[i].name;
			str = str.replace(new RegExp('@'+name,'gmi'),'@<a href="/user/'+name+'">'+name+'</a>');
		}	
		return cb(err,str);
	});
}

exports.send_at_message = send_at_message;
exports.link_at_who = link_at_who;
