/*jslint node: true, regexp: true, nomen: true, indent: 2, vars: true */

'use strict';

var models = require('../models');
var Message = models.Message;
var user_ctrl = require('./user');
var mail_ctrl = require('./mail');
var topic_ctrl = require('./topic');
var EventProxy = require('eventproxy').EventProxy;

function get_message_by_id(id, cb) {
  Message.findOne({_id: id}, function (err, message) {
    if (err) {
      return cb(err);
    }
    if (message.type === 'reply' || message.type === 'reply2' || message.type === 'at') {
      var proxy = new EventProxy();
      var done;
      
      done = function (author, topic) {
        message.author = author;
        message.topic = topic;
        if (!author || !topic) {
          message.is_invalid = true;
        }
        return cb(err, message);
      };

      proxy.assign('author_found', 'topic_found', done);
      user_ctrl.get_user_by_id(message.author_id, function (err, author) {
        if (err) {
          return cb(err);
        }
        proxy.trigger('author_found', author);
      });
      topic_ctrl.get_topic_by_id(message.topic_id, function (err, topic, tags, author) {
        if (err) {
          return cb(err);
        }
        proxy.trigger('topic_found', topic);
      });
    }
    if (message.type === 'follow') {
      user_ctrl.get_user_by_id(message.author_id, function (err, author) {
        if (err) {
          return cb(err);
        }
        message.author = author;
        if (!author) {
          message.is_invalid = true;
        }
        return cb(err, message);
      });
    }
  });
}

function get_messages_count(master_id, cb) {
  Message.count({master_id: master_id, has_read: false}, function (err, messages_count) {
    if (err) {
      return cb(err);
    }
    return cb(err, messages_count);
  });
}

function index(req, res, next) {
  if (!req.session.user) {
    res.redirect('home');
    return;
  }

  var message_ids = [];
  var user_id = req.session.user._id;
  
  Message.find({master_id: user_id}, [], {sort: [['create_at', 'desc']]}, function (err, docs) {
    var i;
    var len;
    var messages = [];
    var proxy;
    var render;
    
    if (err) {
      return next(err);
    }
    
    for (i = 0, len = docs.length; i < len; i += 1) {
      message_ids.push(docs[i]._id);
    }
    
    if (message_ids.length === 0) {
      res.render('message/index', {has_read_messages: [], hasnot_read_messages: []});
      return;
    }

    proxy = new EventProxy();
    
    render = function () {
      var has_read_messages = [];
      var hasnot_read_messages = [];
      var i;
      var len;
      
      for (i = 0, len = messages.length; i < len; i += 1) {
        if (messages[i].is_invalid) {
          messages[i].remove();
        } else {
          if (messages[i].has_read) {
            has_read_messages.push(messages[i]);
          } else {
            hasnot_read_messages.push(messages[i]);
          }
        }
      }
      res.render('message/index', {has_read_messages: has_read_messages, hasnot_read_messages: hasnot_read_messages});
      return;
    };

    proxy.after('message_ready', message_ids.length, render);
    
    function cb(i) {
      return function (err, message) {
        if (err) {
          return next(err);
        }
        messages[i] = message;
        proxy.trigger('message_ready');
      };
    }

    for (i = 0, len = message_ids.length; i < len; i += 1) {
      get_message_by_id(message_ids[i], cb(i));
    }
  });
}

function mark_read(req, res, next) {
  if (!req.session || !req.session.user) {
    res.send('forbidden!');
    return;
  }

  var message_id = req.body.message_id;
  Message.findOne({_id: message_id}, function (err, message) {
    if (err) {
      return next(err);
    }
    if (!message) {
      res.json({status: 'failed'});
      return;
    }
    if (message.master_id.toString() !== req.session.user._id.toString()) {
      res.json({status: 'failed'});
      return;
    }
    message.has_read = true;
    message.save(function (err) {
      if (err) {
        return next(err);
      }
      res.json({status: 'success'});
    });
  });
}

function mark_all_read(req, res, next) {
  if (!req.session || !req.session.user) {
    res.send('forbidden!');
    return;
  }

  Message.find({master_id: req.session.user._id, has_read: false}, function (err, messages) {
    if (messages.length === 0) {
      res.json({'status': 'success'});
      return;
    }
    
    var proxy = new EventProxy();
    var done;
    var i;
    var len;
    var message;
    
    done = function () {
      res.json({'status': 'success'});
    };

    proxy.after('marked', messages.length, done);
    
    function cb(err) {
      proxy.trigger('marked');
    }

    for (i = 0, len = messages.length; i < len; i += 1) {
      message = messages[i];
      message.has_read = true;
      message.save(cb);
    }
  });
}

function send_reply_message(master_id, author_id, topic_id) {
  var message = new Message();
  
  message.type = 'reply';
  message.master_id = master_id;
  message.author_id = author_id;
  message.topic_id = topic_id;
  
  message.save(function (err) {
    user_ctrl.get_user_by_id(master_id, function (err, master) {
      if (master && master.receive_reply_mail) {
        message.has_read = true;
        message.save();
        get_message_by_id(message._id, function (err, msg) {
          mail_ctrl.send_reply_mail(master.email, msg);
        });
      }
    });
  });
}

function send_reply2_message(master_id, author_id, topic_id) {
  var message = new Message();
  
  message.type = 'reply2';
  message.master_id = master_id;
  message.author_id = author_id;
  message.topic_id = topic_id;
  
  message.save(function (err) {
    user_ctrl.get_user_by_id(master_id, function (err, master) {
      if (master && master.receive_reply_mail) {
        message.has_read = true;
        message.save();
        get_message_by_id(message._id, function (err, msg) {
          mail_ctrl.send_reply_mail(master.email, msg);
        });
      }
    });
  });
}

function send_at_message(master_id, author_id, topic_id, callback) {
  var message = new Message();
  
  message.type = 'at';
  message.master_id = master_id;
  message.author_id = author_id;
  message.topic_id = topic_id;
  
  message.save(function (err) {
    user_ctrl.get_user_by_id(master_id, function (err, master) {
      if (master && master.receive_at_mail) {
        message.has_read = true;
        message.save();
        get_message_by_id(message._id, function (err, msg) {
          mail_ctrl.send_at_mail(master.email, msg);
        });
      }
    });
    callback(err);
  });
}

function send_follow_message(follow_id, author_id) {
  var message = new Message();
  message.type = 'follow';
  message.master_id = follow_id;
  message.author_id = author_id;
  message.save();
}

exports.index = index;
exports.mark_read = mark_read;
exports.mark_all_read = mark_all_read;
exports.get_messages_count = get_messages_count;
exports.send_reply_message = send_reply_message;
exports.send_reply2_message = send_reply2_message;
exports.send_follow_message = send_follow_message;
exports.send_at_message = send_at_message;
