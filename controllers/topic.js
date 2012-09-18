/*!
 * nodeclub - controllers/topic.js
 */

/**
 * Module dependencies.
 */

var models = require('../models');
var Tag = models.Tag;
var Topic = models.Topic;
var TopicTag = models.TopicTag;
var TopicCollect = models.TopicCollect;
var Relation = models.Relation;
var check = require('validator').check;
var sanitize = require('validator').sanitize;
var at_ctrl = require('./at');
var tag_ctrl = require('./tag');
var user_ctrl = require('./user');
var reply_ctrl = require('./reply');
var EventProxy = require('eventproxy').EventProxy;
var Showdown = require('../public/libs/showdown');
var Util = require('../libs/util');

/**
 * Topic page
 * 
 * @param  {HttpRequest} req
 * @param  {HttpResponse} res
 * @param  {Function} next
 */
exports.index = function (req, res, next) {
  var topic_id = req.params.tid;
  if (topic_id.length !== 24) {
    return res.render('notify/notify', {
      error: '此话题不存在或已被删除。'
    });
  }
  var events = [ 'topic', 'other_topics', 'no_reply_topics', 'get_relation', '@user'];
  var ep = EventProxy.create(events, function (topic, other_topics, no_reply_topics, relation) {
    res.render('topic/index', {
      topic: topic,
      author_other_topics: other_topics,
      no_reply_topics: no_reply_topics,
      relation : relation
    });
  });

  ep.on('error', function (err) {
    ep.unbind();
    next(err);
  });

  ep.once('topic', function(topic) {
    if (topic.content_is_html) {
      return ep.emit('@user');
    }
    at_ctrl.link_at_who(topic.content, function (err, content) {
      if (err) {
        return ep.emit(err);
      }
      topic.content = Showdown.parse(Util.escape(content));
      ep.emit('@user');
    });
  });

  get_full_topic(topic_id, function (err, message, topic, tags, author, replies) {
    if (err) {
      return ep.emit('error', err);
    }
    if (message) {
      ep.unbind();
      return res.render('notify/notify', { error: message });
    }

    topic.visit_count += 1;
    topic.save(function (err) {
      // format date
      topic.friendly_create_at = Util.format_date(topic.create_at, true);
      topic.friendly_update_at = Util.format_date(topic.update_at, true);

      topic.tags = tags;
      topic.author = author;
      topic.replies = replies;

      if (!req.session.user) {
        ep.emit('topic', topic);
      } else {
        var q = { user_id: req.session.user._id, topic_id: topic._id };
        TopicCollect.findOne(q, function (err, doc) {
          if (err) {
            return ep.emit('error', err);
          }
          topic.in_collection = doc;
          ep.emit('topic', topic);
        });
      }   
    });

    //get author's relationship
    if (!req.session.user || req.session.user._id) {
      ep.emit('get_relation', null);
    } else {
      Relation.findOne({user_id: req.session.user._id, follow_id: topic.author_id}, function (err, relation) {
        if (err) {
          return ep.emit('error', err);
        }
        ep.emit('get_relation', relation);
      });
    }

    // get author other topics
    var options = { limit: 5, sort: [ [ 'last_reply_at', 'desc' ] ]};
    var query = { author_id: topic.author_id, _id: { '$nin': [ topic._id ] } };
    get_topics_by_query(query, options, function (err, topics) {
      if (err) {
        return ep.emit('error', err);
      }
      ep.emit('other_topics', topics);      
    });

    // get no reply topics
    var options2 = { limit:5, sort: [ ['create_at', 'desc'] ] };
    get_topics_by_query({ reply_count: 0 }, options2, function(err, topics) {
      if (err) return ep.emit('error', err);
      ep.emit('no_reply_topics', topics);
    });
  });
};

exports.create = function (req, res, next) {
  if (!req.session.user) {
    res.render('notify/notify', {error: '未登入用户不能发布话题。'});
    return;
  }

  var method = req.method.toLowerCase();
  if(method == 'get'){
    tag_ctrl.get_all_tags(function(err,tags){
      if(err) return next(err);
      res.render('topic/edit',{tags:tags});
      return;
    });
  }

  if(method == 'post'){
    var title = sanitize(req.body.title).trim();
    title = sanitize(title).xss();
    var content = req.body.t_content;
    var topic_tags=[];
    if(req.body.topic_tags != ''){
      topic_tags = req.body.topic_tags.split(',');
    } 

    if(title == ''){
      tag_ctrl.get_all_tags(function(err,tags){
        if(err) return next(err);
        for(var i=0; i<topic_tags.length; i++){
          for(var j=0; j<tags.length; j++){
            if(topic_tags[i] == tags[j]._id){
              tags[j].is_selected = true;
            }
          } 
        }
        res.render('topic/edit',{tags:tags, edit_error:'标题不能是空的。', content:content});
        return;
      });
    }else if(title.length<10 || title.length>100){
      tag_ctrl.get_all_tags(function(err,tags){
        if(err) return next(err);
        for(var i=0; i<topic_tags.length; i++){
          for(var j=0; j<tags.length; j++){
            if(topic_tags[i] == tags[j]._id){
              tags[j].is_selected = true;
            }
          } 
        }
        res.render('topic/edit',{tags:tags, edit_error:'标题字数太多或太少', title:title, content:content});
        return;
      });
    }else{
      var topic = new Topic();
      topic.title = title;
      topic.content = content;
      topic.author_id = req.session.user._id;
      topic.save(function(err){
        if(err) return next(err);
      
        var proxy = new EventProxy();
        var render = function(){
          res.redirect('/topic/'+topic._id);
        }

        proxy.assign('tags_saved','score_saved',render)
        //话题可以没有标签
        if(topic_tags.length == 0){
          proxy.emit('tags_saved');
        }
        var tags_saved_done = function(){
          proxy.emit('tags_saved');
        };
        proxy.after('tag_saved',topic_tags.length,tags_saved_done);
        //save topic tags 
        for(var i=0; i<topic_tags.length; i++){
          (function(i){
            var topic_tag = new TopicTag();
            topic_tag.topic_id = topic._id;
            topic_tag.tag_id = topic_tags[i];
            topic_tag.save(function(err){
              if(err) return next(err);
              proxy.emit('tag_saved');
            });
            tag_ctrl.get_tag_by_id(topic_tags[i],function(err,tag){
              if(err) return next(err);
              tag.topic_count += 1;
              tag.save();
            });
          })(i);
        }
        user_ctrl.get_user_by_id(req.session.user._id,function(err,user){
          if(err) return next(err);
          user.score += 5;
          user.topic_count += 1;
          user.save();
          req.session.user.score += 5;  
          proxy.emit('score_saved');
        });

        //发送at消息
        at_ctrl.send_at_message(content,topic._id,req.session.user._id);
      });
    }
  } 
};

exports.edit = function(req,res,next){
  if(!req.session.user){
    res.redirect('home');
    return;
  }

  var topic_id = req.params.tid;
  var method = req.method.toLowerCase();
  if(method == 'get'){
    if(topic_id.length != 24){
      res.render('notify/notify',{error: '此话题不存在或已被删除。'});
      return; 
    }
    get_topic_by_id(topic_id,function(err,topic,tags,author){
      if(!topic){
        res.render('notify/notify',{error: '此话题不存在或已被删除。'});
        return; 
      }
      if(topic.author_id == req.session.user._id || req.session.user.is_admin){
        tag_ctrl.get_all_tags(function(err,all_tags){
          if(err) return next(err);
          for(var i=0; i<tags.length; i++){
            for(var j=0; j<all_tags.length; j++){
              if(tags[i].id == all_tags[j].id){
                all_tags[j].is_selected = true;
              }
            } 
          }

          res.render('topic/edit',{action:'edit',topic_id:topic._id,title:topic.title,content:topic.content,tags:all_tags});
        });
      }else{
        res.render('notify/notify',{error:'对不起，你不能编辑此话题。'});
        return;
      }
    });
  }
  if(method == 'post'){
    if(topic_id.length != 24){
      res.render('notify/notify',{error: '此话题不存在或已被删除。'});
      return; 
    }
    get_topic_by_id(topic_id,function(err,topic,tags,author){
      if(!topic){
        res.render('notify/notify',{error: '此话题不存在或已被删除。'});
        return; 
      }
      if(topic.author_id == req.session.user._id || req.session.user.is_admin){
        var title = sanitize(req.body.title).trim();
        title = sanitize(title).xss();
        var content = req.body.t_content;
        var topic_tags=[];
        if(req.body.topic_tags != ''){
          topic_tags = req.body.topic_tags.split(',');
        }

        if(title == ''){
          tag_ctrl.get_all_tags(function(err,all_tags){
            if(err) return next(err);
            for(var i=0; i<topic_tags.length; i++){
              for(var j=0; j<all_tags.length; j++){
                if(topic_tags[i] == all_tags[j]._id){
                  all_tags[j].is_selected = true;
                }
              } 
            }
            res.render('topic/edit',{action:'edit',edit_error:'标题不能是空的。',topic_id:topic._id, content:content,tags:all_tags});
            return;
          });
        }else{
          //保存话题
          //删除topic_tag，标签topic_count减1
          //保存新topic_tag  
          topic.title = title;
          topic.content = content;
          topic.update_at = new Date();
          topic.save(function(err){
            if(err) return next(err);

            var proxy = new EventProxy();
            var render = function(){
              res.redirect('/topic/'+topic._id);
            }
            proxy.assign('tags_removed_done','tags_saved_done',render);

            // 删除topic_tag
            var tags_removed_done = function(){
              proxy.emit('tags_removed_done');
            };
            TopicTag.find({topic_id:topic._id},function(err,docs){
              if(docs.length == 0){
                proxy.emit('tags_removed_done');
              }else{
                proxy.after('tag_removed',docs.length,tags_removed_done);
                // delete topic tags
                for(var i=0; i<docs.length; i++){
                  (function(i){
                    docs[i].remove(function(err){
                      if(err) return next(err);
                      tag_ctrl.get_tag_by_id(docs[i].tag_id,function(err,tag){
                        if(err) return next(err);
                        proxy.emit('tag_removed');
                        tag.topic_count -= 1;
                        tag.save();
                      });
                    });
                  })(i); 
                }
              }
            });
          
            // 保存topic_tag
            var tags_saved_done = function(){
              proxy.emit('tags_saved_done');
            } 
            //话题可以没有标签
            if(topic_tags.length == 0){
              proxy.emit('tags_saved_done');
            }else{
              proxy.after('tag_saved',topic_tags.length,tags_saved_done);
              //save topic tags 
              for(var i=0; i<topic_tags.length; i++){
                (function(i){
                  var topic_tag = new TopicTag();
                  topic_tag.topic_id = topic._id;
                  topic_tag.tag_id = topic_tags[i];
                  topic_tag.save(function(err){
                    if(err) return next(err);
                    proxy.emit('tag_saved');
                  });
                  tag_ctrl.get_tag_by_id(topic_tags[i],function(err,tag){
                    if(err) return next(err);
                    tag.topic_count += 1;
                    tag.save();
                  });
                })(i);
              }
            }

            //发送at消息
            at_ctrl.send_at_message(content,topic._id,req.session.user._id);
          });
        } 
      }else{
        res.render('notify/notify',{error:'对不起，你不能编辑此话题。'});
        return;
      }
    });
  }
};

exports.delete = function(req,res,next){
  //删除话题, 话题作者topic_count减1
  //删除回复，回复作者reply_count减1
  //删除topic_tag，标签topic_count减1
  //删除topic_collect，用户collect_topic_count减1
  if(!req.session.user || !req.session.user.is_admin){
    res.redirect('home');
    return;
  }
  var topic_id = req.params.tid;
  if(topic_id.length != 24){
    res.render('notify/notify',{error: '此话题不存在或已被删除。'});
    return; 
  }
  get_topic_by_id(topic_id,function(err,topic,tags,author){
    if(!topic){
      res.render('notify/notify',{error: '此话题不存在或已被删除。'});
      return; 
    }
    var proxy = new EventProxy();
    var render = function(){
      res.render('notify/notify',{success: '话题已被删除。'});
      return;
    }
    proxy.assign('topic_removed',render);
    topic.remove(function(err){
      proxy.emit('topic_removed');
    });
  });
};

exports.top = function (req, res, next) {
  if (!req.session.user.is_admin) {
    res.redirect('home');
    return;
  }
  var topic_id = req.params.tid;
  var is_top = req.params.is_top;
  if (topic_id.length !== 24) {
    res.render('notify/notify' , {error: '此话题不存在或已被删除。'} );
    return; 
  }
  get_topic_by_id(topic_id, function(err, topic, tags, author) {
    if (!topic) {
      res.render('notify/notify', {error: '此话题不存在或已被删除。'} );
      return; 
    }
    topic.top = is_top;
    var proxy = new EventProxy();
    var render = function() {
      var msg = topic.top ? '此话题已经被置顶。' : '此话题已经被取消置顶。';
      res.render('notify/notify', {success: msg} );
      return;
    }
    proxy.assign('topic_top', render);
    topic.save( function(err) {
      proxy.emit('topic_top');
    });
  });
};

exports.collect = function(req,res,next){
  if(!req.session || !req.session.user){
    res.send('forbidden!');
    return;
  }
  var topic_id = req.body.topic_id;
  Topic.findOne({_id: topic_id},function(err,topic){
    if(err) return next(err);
    if(!topic){
      res.json({status:'failed'});
    }
    
    TopicCollect.findOne({user_id:req.session.user._id,topic_id:topic._id},function(err,doc){
      if(err) return next(err);
      if(doc){
        res.json({status:'success'});
        return;
      }
        
      var topic_collect = new TopicCollect();
      topic_collect.user_id = req.session.user._id;
      topic_collect.topic_id = topic._id;
      topic_collect.save(function(err){
        if(err) return next(err);
        res.json({status:'success'});
      });
      user_ctrl.get_user_by_id(req.session.user._id,function(err,user){
        if(err) return next(err);
        user.collect_topic_count += 1;
        user.save()
      });       

      req.session.user.collect_topic_count += 1;
      topic.collect_count += 1;
      topic.save();
    });
  });
};

exports.de_collect = function(req,res,next){
  if(!req.session || !req.session.user){
    res.send('fobidden!');
    return;
  }
  var topic_id = req.body.topic_id;
  Topic.findOne({_id: topic_id},function(err,topic){
    if(err) return next(err);
    if(!topic){
      res.json({status:'failed'});
    }
    TopicCollect.remove({user_id:req.session.user._id,topic_id:topic._id},function(err){
      if(err) return next(err);
      res.json({status:'success'});
    });

    user_ctrl.get_user_by_id(req.session.user._id,function(err,user){
      if(err) return next(err);
      user.collect_topic_count -= 1;
      user.save();
    });

    topic.collect_count -= 1;
    topic.save();

    req.session.user.collect_topic_count -= 1;
  });
};

// get topic without replies
function get_topic_by_id(id, cb) {
  var proxy = new EventProxy();
  var done = function (topic, tags, author, last_reply) {
    return cb(null, topic, tags, author, last_reply);
  };
  proxy.assign('topic', 'tags', 'author', 'last_reply', done);

  Topic.findOne({_id: id}, function (err, topic) {
    if (err) {
      return cb(err);
    }
    if (!topic) {
      proxy.emit('topic', null);
      proxy.emit('tags', []);
      proxy.emit('author', null);
      proxy.emit('last_reply', null);
      return;
    }
    proxy.emit('topic', topic);
    
    TopicTag.find({topic_id: topic._id}, function (err, topic_tags) {
      if(err) return cb(err);
      var tags_id = [];
      for(var i=0; i<topic_tags.length; i++){
        tags_id.push(topic_tags[i].tag_id);
      }
      tag_ctrl.get_tags_by_ids(tags_id,function(err,tags){
        if(err) return cb(err);
        proxy.emit('tags',tags);
      });
    });
    
    user_ctrl.get_user_by_id(topic.author_id, function (err, author) {
      if (err) {
        return cb(err);
      }
      proxy.emit('author', author);
    });

    if (topic.last_reply) {
      reply_ctrl.get_reply_by_id(topic.last_reply, function (err, last_reply) {
        if (err) {
          return cb(err);
        }
        if (!last_reply) {
          proxy.emit('last_reply', null);
          return;
        }
        proxy.emit('last_reply', last_reply);
      });
    } else {
      proxy.emit('last_reply', null);
    }
  });
}
// get topic with replies
function get_full_topic(id, cb) {
  var proxy = new EventProxy();
  var done = function(topic,tags,author,replies){
    return cb(null, '', topic,tags,author,replies);
  };
  proxy.assign('topic','tags','author','replies',done);

  Topic.findOne({_id:id},function(err,topic){
    if(err) return cb(err);
    if(!topic){
      return cb(null, '此话题不存在或已被删除。');  
    }
    proxy.emit('topic',topic);
    
    TopicTag.find({topic_id: topic._id}, function(err,topic_tags){
      if(err) return cb(err);
      var tags_id = [];
      for(var i=0; i<topic_tags.length; i++){
        tags_id.push(topic_tags[i].tag_id);
      }
      tag_ctrl.get_tags_by_ids(tags_id,function(err,tags){
        if(err) return cb(err);
        proxy.emit('tags',tags);
      });
    });
    
    user_ctrl.get_user_by_id(topic.author_id,function(err,author){
      if(err) return cb(err);
      if(!author){
        return cb(null, '话题的作者丢了。');  
      }
      proxy.emit('author',author);
    }); 
    
    reply_ctrl.get_replies_by_topic_id(topic._id,function(err,replies){
      if(err) return cb(err);
      proxy.emit('replies',replies);
    });

  });

}
function get_topics_by_query(query,opt, cb) {
  Topic.find(query, ['_id'], opt, function (err, docs) {
    if (err) {
      return cb(err);
    }
    if (docs.length === 0) {
      return cb(null, []);
    }

    var topics_id = [];
    for (var i = 0; i < docs.length; i++) {
      topics_id.push(docs[i]._id);
    }

    var proxy = new EventProxy();
    var done = function () {
      return cb(null, topics);
    }
    var topics = [];
    proxy.after('topic_ready', topics_id.length, done);
    for (var i=0; i<topics_id.length; i++) {
      (function(i){
        get_topic_by_id(topics_id[i], function (err, topic, tags, author, last_reply) {
          if (err) {
            return cb(err);
          }
          topic.tags = tags;
          topic.author = author;
          topic.reply = last_reply;
          topic.friendly_create_at = Util.format_date(topic.create_at,true);
          topics[i] = topic;
          proxy.emit('topic_ready');
        }); 
      })(i);
    }
  }); 
}
function get_count_by_query(query,cb){
  Topic.count(query,function(err,count){
    if(err) return cb(err);
    return cb(err,count);
  });
}

exports.get_topic_by_id = get_topic_by_id;
exports.get_full_topic = get_full_topic;
exports.get_topics_by_query = get_topics_by_query;
exports.get_count_by_query = get_count_by_query;
