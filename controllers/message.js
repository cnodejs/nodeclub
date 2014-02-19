var Message = require('../proxy').Message;
var EventProxy = require('eventproxy');

exports.index = function (req, res, next) {
  if (!req.session.user) {
    res.redirect('home');
    return;
  }

  var message_ids = [];
  var user_id = req.session.user._id;
  Message.getMessagesByUserId(user_id, function (err, docs) {
    if (err) {
      return next(err);
    }
    for (var i = 0; i < docs.length; i++) {
      message_ids.push(docs[i]._id);
    }
    var messages = [];
    if (message_ids.length === 0) {
      res.render('message/index', {has_read_messages: [], hasnot_read_messages: []});
      return;
    }
    var proxy = new EventProxy();
    var render = function () {
      var has_read_messages = [];
      var hasnot_read_messages = [];
      for (var i = 0; i < messages.length; i++) {
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
    message_ids.forEach(function (id, i) {
      Message.getMessageById(id, function (err, message) {
        if (err) {
          return next(err);
        }
        messages[i] = message;
        proxy.emit('message_ready');
      });
    });
  });
};

exports.mark_read = function (req, res, next) {
  if (!req.session || !req.session.user) {
    res.send('forbidden!');
    return;
  }

  var message_id = req.body.message_id;
  Message.getMessageById(message_id, function (err, message) {
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
};

exports.mark_all_read = function (req, res, next) {
  if (!req.session || !req.session.user) {
    res.send('forbidden!');
    return;
  }
  // TODO: 直接做update，无需查找然后再逐个修改。
  Message.getUnreadMessageByUserId(req.session.user._id, function (err, messages) {
    if (messages.length === 0) {
      res.json({'status': 'success'});
      return;
    }
    var proxy = new EventProxy();
    proxy.after('marked', messages.length, function () {
      res.json({'status': 'success'});
    });
    proxy.fail(next);
    for (var i = 0; i < messages.length; i++) {
      var message = messages[i];
      message.has_read = true;
      message.save(proxy.done('marked'));
    }
  });
};
exports.notice=function(req,res,next){
  if (!req.session || !req.session.user) {
    res.send("");
    return;
  }
  var message_ids = [];
  var user_id = req.session.user._id;
  Message.getMessagesCount(user_id, function (err, count) {
    if (err) {
      return next(err);
    }

    if (count === 0) {
      res.json(null);
      return;
    }
    res.json({
      newNotice:count,
      url:'/my/messages'
    });
  });
}
