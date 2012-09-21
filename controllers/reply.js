var models = require('../models');
var Reply = models.Reply;
var Topic = models.Topic;
var Message = models.Message;

var check = require('validator').check;
var sanitize = require('validator').sanitize;

var at_ctrl = require('./at');
var user_ctrl = require('./user');
var message_ctrl = require('./message');

var Util = require('../libs/util');
var Showdown = require('../public/libs/showdown');
var EventProxy = require('eventproxy').EventProxy;

exports.add = function (req, res, next) {
  if (!req.session || !req.session.user) {
    res.send('forbidden!');
    return;
  }

  var content = req.body.r_content;
  var topic_id = req.params.topic_id;

  var str = sanitize(content).trim();
  if (str === '') {
    res.render('notify/notify', {error: '回复内容不能为空！'});
    return;
  }
  
  var render = function () {
    res.redirect('/topic/' + topic_id);
  };
  var proxy = new EventProxy();
  proxy.assign('reply_saved', 'message_saved', 'score_saved', render);

  var reply = new Reply();
  reply.content = content;
  reply.topic_id = topic_id; 
  reply.author_id = req.session.user._id;
  reply.save(function (err) {
    if (err) {
      return next(err);
    }
    Topic.findOne({_id: topic_id}, function (err, topic) {
      if (err) {
        return next(err);
      }
      topic.last_reply = reply._id;
      topic.last_reply_at = new Date();
      topic.reply_count += 1;
      topic.save();
      proxy.emit('reply_saved');
      //发送at消息
      at_ctrl.send_at_message(content, topic_id, req.session.user._id);
    });
  });

  Topic.findOne({_id: topic_id}, function (err, topic) {
    if (err) {
      return next(err);
    }
    if (topic.author_id.toString() === req.session.user._id.toString()) {
      proxy.emit('message_saved');
    } else {
      message_ctrl.send_reply_message(topic.author_id, req.session.user._id, topic._id);  
      proxy.emit('message_saved');
    }
  });

  user_ctrl.get_user_by_id(req.session.user._id, function (err, user) {
    if (err) {
      return next(err);
    }
    user.score += 5;
    user.reply_count += 1;
    user.save();
    req.session.user.score += 5;  
    proxy.emit('score_saved');
  });
};

exports.add_reply2 = function (req, res, next) {
  if (!req.session || !req.session.user) {
    res.send('forbidden!');
    return;
  }

  var topic_id = req.params.topic_id;
  var reply_id = req.body.reply_id;
  var content = req.body.r2_content;

  var str = sanitize(content).trim();
  if (str === '') {
    res.send('');
    return;
  }
  
  var done = function () {
    get_reply_by_id(reply._id, function (err, reply) {
      res.partial('reply/reply2', {object: reply, as: 'reply'});
    });
  };
  var proxy = new EventProxy();
  proxy.assign('reply_saved', 'message_saved', done);

  var reply = new Reply();
  reply.content = content;
  reply.topic_id = topic_id; 
  //标识是二级回复
  reply.reply_id = reply_id;
  reply.author_id = req.session.user._id;
  reply.save(function (err) {
    if (err) {
      return next(err);
    }
    Topic.findOne({_id: topic_id}, function (err, topic) {
      if (err) {
        return next(err);
      }
      topic.last_reply = reply._id;
      topic.last_reply_at = new Date();
      topic.reply_count += 1;
      topic.save();
      proxy.emit('reply_saved');
      //发送at消息
      at_ctrl.send_at_message(content, topic_id, req.session.user._id);
    });
  });

  Reply.findOne({_id: reply_id}, function (err, reply) {
    if (err) {
      return next(err);
    }
    if (reply.author_id.toString() === req.session.user._id.toString()) {
      proxy.emit('message_saved');
    } else {
      message_ctrl.send_reply2_message(reply.author_id, req.session.user._id, topic_id);
      proxy.emit('message_saved');
    }
  });
};

exports.delete = function (req, res, next) {
  var reply_id = req.body.reply_id;
  get_reply_by_id(reply_id, function (err, reply) {
    if (!reply) {
      res.json({status: 'failed'});
      return;
    }
    if (reply.author_id.toString() === req.session.user._id.toString()) {
      reply.remove();
      res.json({status: 'success'});

      if (!reply.reply_id) {
        reply.author.score -= 5;
        reply.author.reply_count -= 1;
        reply.author.save();
      }
    } else {
      res.json({status: 'failed'});
      return;
    }

    Topic.findOne({_id: reply.topic_id}, function (err, topic) {
      if (topic) {
        topic.reply_count -= 1;
        topic.save();
      }
    });
  });
};

function get_reply_by_id(id, cb) {
  Reply.findOne({_id: id}, function (err, reply) {
    if (err) {
      return cb(err);
    }
    if (!reply) {
      return cb(err, null);
    }

    var author_id = reply.author_id;
    user_ctrl.get_user_by_id(author_id, function (err, author) {
      if (err) {
        return cb(err);
      }
      reply.author = author;
      reply.friendly_create_at = Util.format_date(reply.create_at, true);
      if (reply.content_is_html) {
        return cb(null, reply);
      }
      at_ctrl.link_at_who(reply.content, function (err, str) {
        if (err) {
          return cb(err);
        }
        reply.content = Util.xss(Showdown.parse(str));
        return cb(err, reply);
      });
    });
  });
}

function get_replies_by_topic_id(id, cb) {
  Reply.find({topic_id: id}, [], {sort: [['create_at', 'asc']]}, function (err, replies) {
    if (err) {
      return cb(err);
    }
    if (replies.length === 0) {
      return cb(err, []);
    }

    var proxy = new EventProxy();
    var done = function () {
      var replies2 = [];
      for (var i = replies.length - 1; i >= 0; i--) {
        if (replies[i].reply_id) {
          replies2.push(replies[i]);  
          replies.splice(i, 1);
        }
      }
      for (var j = 0; j < replies.length; j++) {
        replies[j].replies = [];
        for (var k = 0; k < replies2.length; k++) {
          var id1 = replies[j]._id;
          var id2 = replies2[k].reply_id;
          if (id1.toString() === id2.toString()) {
            replies[j].replies.push(replies2[k]); 
          } 
        }
        replies[j].replies.reverse();
      }
      return cb(err, replies);
    };
    proxy.after('reply_find', replies.length, done);
    for (var j = 0; j < replies.length; j++) {
      (function (i) {
        var author_id = replies[i].author_id;
        user_ctrl.get_user_by_id(author_id, function (err, author) {
          if (err) {
            return cb(err);
          }
          replies[i].author = author;
          replies[i].friendly_create_at = Util.format_date(replies[i].create_at, true);
          if (replies[i].content_is_html) {
            return proxy.emit('reply_find');
          }
          at_ctrl.link_at_who(replies[i].content, function (err, str) {
            if (err) {
              return cb(err);
            }
            replies[i].content = Util.xss(Showdown.parse(str));
            proxy.emit('reply_find');
          });
        });
      })(j);
    }
  }); 
}
exports.get_reply_by_id = get_reply_by_id;
exports.get_replies_by_topic_id = get_replies_by_topic_id;  
