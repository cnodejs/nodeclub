var models = require('../models'),
	Tag = models.Tag,
	TopicTag = models.TopicTag,
	TagCollect = models.TagCollect;

var check = require('validator').check,
	sanitize = require('validator').sanitize;

var user_ctrl = require('./user');
var topic_ctrl = require('./topic');
var config = require('../config').config;
var EventProxy = require('eventproxy').EventProxy;

exports.list_topic = function(req,res,next){
	var tag_name = req.params.name;
	var page = Number(req.query.page) || 1;
	var limit = config.list_topic_count;

	Tag.findOne({name:tag_name},function(err,tag){
		if(err) return next(err);
		if(tag){
			var done = function(topic_ids,collection,hot_topics,no_reply_topics,pages){
				var query = {'_id':{'$in':topic_ids}};
				var opt = {skip:(page-1)*limit, limit:limit, sort:[['create_at','desc']]};		

				topic_ctrl.get_topics_by_query(query,opt,function(err,topics){
					for(var i=0; i<topics.length; i++){
						for(var j=0; j<topics[i].tags.length; j++){
							if(topics[i].tags[j].id == tag.id){
								topics[i].tags[j].highlight = true;
							}
						}
					}
					res.render('tag/list_topic',{tag:tag,topics:topics,current_page:page,list_topic_count:limit,in_collection:collection,
							hot_topics:hot_topics,no_reply_topics:no_reply_topics,pages:pages});
				});
			}

			var proxy = new EventProxy();
			proxy.assign('topic_ids','collection','hot_topics','no_reply_topics','pages',done);

			TopicTag.find({tag_id:tag._id},function(err,docs){
				if(err) return next(err);
				var topic_ids = [];

				for(var i=0; i<docs.length; i++){
					topic_ids.push(docs[i].topic_id);
				}
				proxy.trigger('topic_ids',topic_ids);

				topic_ctrl.get_count_by_query({'_id':{'$in':topic_ids}},function(err,all_topics_count){
					if(err) return next(err);
					var pages = Math.ceil(all_topics_count/limit);
					proxy.trigger('pages',pages);
				});

			});

			if(!req.session.user){
				proxy.trigger('collection',null);
			}else{ 
				TagCollect.findOne({user_id:req.session.user._id,tag_id:tag._id},function(err,doc){
					if(err) return next(err);
					proxy.trigger('collection',doc);
				});
			}

			var opt = {limit:5, sort:[['visit_count','desc']]};
			topic_ctrl.get_topics_by_query({},opt,function(err,hot_topics){
				if(err) return next(err);
				proxy.trigger('hot_topics',hot_topics);
			});

			opt = {limit:5, sort:[['create_at','desc']]};
			topic_ctrl.get_topics_by_query({reply_count:0},opt,function(err,no_reply_topics){
				if(err) return next(err);
				proxy.trigger('no_reply_topics',no_reply_topics);
			});
		}else{
			res.render('notify/notify',{error:'没有这个标签。'});
			return;
		}
	});
};

exports.edit_tags = function(req,res,next){
	if(!req.session.user){
		res.render('notify/notify',{error:'你还没有登录。'});
		return;
	}
	if(!req.session.user.is_admin){
		res.render('notify/notify',{error:'管理员才能编辑标签。'});
		return;
	}
	get_all_tags(function(err,tags){
		if(err) return next(err);
		res.render('tag/edit_all',{tags:tags});
		return;
	});
};

exports.add = function(req,res,next){
	if(!req.session || !req.session.user || !req.session.user.is_admin){
		res.send('fobidden!');
		return;
	}
	
	var name = sanitize(req.body.name).trim();
	name = sanitize(name).xss();	
	var description = sanitize(req.body.description).trim();
	description = sanitize(description).xss();	
	var order = req.body.order;
	
	if(name == ''){
		res.render('notify/notify', {error:'信息不完整。'});
		return;
	}

	Tag.find({'name':name},function(err,tags){
		if(err) return next(err);
		if(tags.length > 0){
			res.render('notify/notify',{error:'这个标签已存在。'});
			return;
		}

		var tag = new Tag();
		tag.name = name;
		tag.order = order;
		tag.description = description;
		tag.save(function(err){
			if(err) return next(err);
			res.redirect('/tags/edit');
		});
	});
};

exports.edit = function(req,res,next){
	if(!req.session.user){
		res.render('notify/notify',{error:'你还没有登录。'});
		return;
	}
	if(!req.session.user.is_admin){
		res.render('notify/notify',{error:'管理员才能编辑标签。'});
		return;
	}
	var tag_name = req.params.name;
	Tag.findOne({name:tag_name},function(err,tag){
		if(err) return next(err);
		if(tag){
			var method = req.method.toLowerCase();
			if(method == 'get'){
				get_all_tags(function(err,tags){
					if(err) return next(err);
					res.render('tag/edit',{tag:tag,tags:tags});
					return;
				});
			}
			if(method == 'post'){
				var name = sanitize(req.body.name).trim();
				name = sanitize(name).xss();	
				var order = req.body.order;
				var description = sanitize(req.body.description).trim();
				description = sanitize(description).xss();	
				if(name == ''){
					res.render('notify/notify', {error:'信息不完整。'});
					return;
				}
				tag.name = name;
				tag.order = order;
				tag.description = description;
				tag.save(function(err){
					if(err) return next(err);
					res.redirect('/tags/edit');
				})
			}
		}else{
			res.render('notify/notify',{error:'没有这个标签。'});
			return;
		}
	});
}

exports.delete = function(req,res,next){
	if(!req.session.user){
		res.render('notify/notify',{error:'你还没有登录。'});
		return;
	}
	if(!req.session.user.is_admin){
		res.render('notify/notify',{error:'管理员才能编辑标签。'});
		return;
	}
	var tag_name = req.params.name;
	Tag.findOne({name:tag_name},function(err,tag){
		if(err) return next(err);
		if(tag){
			var proxy = new EventProxy();
			var done = function(){
				tag.remove(function(err){
					if(err) return next(err);
					res.redirect('/');
				});		
			}
			proxy.assign('topic_tag_removed','tag_collect_removed',done);
			TopicTag.remove({tag_id:tag._id},function(err){
				if(err) return next(err);
				proxy.trigger('topic_tag_removed');	
			});
			TagCollect.remove({tag_id:tag._id},function(err){
				if(err) return next(err);
				proxy.trigger('tag_collect_removed')
			});
		}else{
			res.render('notify/notify',{error:'没有这个标签。'});
			return;
		}
	});
}

exports.collect = function(req,res,next){
	if(!req.session || !req.session.user){
		res.send('fobidden!');
		return;
	}
	var tag_id = req.body.tag_id;
	Tag.findOne({_id: tag_id},function(err,tag){
		if(err) return next(err);
		if(!tag){
			res.json({status:'failed'});
		}
		
		TagCollect.findOne({user_id:req.session.user._id,tag_id:tag._id},function(err,doc){
			if(err) return next(err);
			if(doc){
				res.json({status:'success'});
				return;
			}
			var tag_collect = new TagCollect();
			tag_collect.user_id = req.session.user._id;
			tag_collect.tag_id = tag._id;
			tag_collect.save(function(err){
				if(err) return next(err);
				//用户更新collect_tag_count
				user_ctrl.get_user_by_id(req.session.user._id,function(err,user){
					if(err) return next(err);
					user.collect_tag_count += 1;
					user.save();
					req.session.user.collect_tag_count += 1;
					//标签更新collect_count
					tag.collect_count += 1;
					tag.save()
					res.json({status:'success'});
				});
			});
		});
	});
};

exports.de_collect = function(req,res,next){
	if(!req.session || !req.session.user){
		res.send('fobidden!');
		return;
	}
	var tag_id = req.body.tag_id;
	Tag.findOne({_id: tag_id},function(err,tag){
		if(err) return next(err);
		if(!tag){
			res.json({status:'failed'});
		}
		TagCollect.remove({user_id:req.session.user._id,tag_id:tag._id},function(err){
			if(err) return next(err);
			//用户更新collect_tag_count
			user_ctrl.get_user_by_id(req.session.user._id,function(err,user){
				if(err) return next(err);
				user.collect_tag_count -= 1;
				user.save()
				req.session.user.collect_tag_count -= 1;
				tag.collect_count -= 1;
				tag.save();
				res.json({status:'success'});
			});
		});
	});
};

function get_all_tags(cb){
	Tag.find({},[],{sort:[['order','asc']]},function(err,tags){
		if(err) return cb(err,[])
		return cb(err,tags);
	});	
};
function get_tag_by_name(name,cb){
	Tag.findOne({name:name},function(err,tag){
		if(err) return cb(err,null);
		return cb(err,tag);
	});
}
function get_tag_by_id(id,cb){
	Tag.findOne({_id:id},function(err,tag){
		if(err) return cb(err,null);
		return cb(err,tag);
	});
}
function get_tags_by_ids(ids,cb){
	Tag.find({_id:{'$in':ids}},function(err,tags){
		if(err) return cb(err);
		return cb(err,tags);
	});	
}
function get_tags_by_query(query,opt,cb){
	Tag.find(query,[],opt,function(err,tags){
		if(err) return cb(err);
		return cb(err,tags);
	});
}
exports.get_all_tags = get_all_tags;
exports.get_tag_by_name = get_tag_by_name;
exports.get_tag_by_id = get_tag_by_id;
exports.get_tags_by_ids = get_tags_by_ids;
exports.get_tags_by_query = get_tags_by_query;
