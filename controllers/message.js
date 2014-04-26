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
            messages[i].has_read = true;
            messages[i].save();
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
