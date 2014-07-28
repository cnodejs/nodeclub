var Message = require('../proxy').Message;
var eventproxy = require('eventproxy');

exports.index = function (req, res, next) {
  if (!req.session.user) {
    res.redirect('/');
    return;
  }
  var user_id = req.session.user._id;
  var ep = new eventproxy();
  ep.fail(next);

  ep.all('has_read_messages', 'hasnot_read_messages', function (has_read_messages, hasnot_read_messages) {
    res.render('message/index', {has_read_messages: has_read_messages, hasnot_read_messages: hasnot_read_messages});
  });

  ep.all('has_read', 'unread', function (has_read, unread) {
    [has_read, unread].forEach(function (msgs, idx) {
      var epfill = new eventproxy();
      epfill.fail(next);
      epfill.after('message_ready', msgs.length, function (docs) {
        docs = docs.filter(function (doc) {
          return !doc.is_invalid;
        });
        ep.emit(idx === 0 ? 'has_read_messages' : 'hasnot_read_messages', docs);
      });
      msgs.forEach(function (doc) {
        Message.getMessageById(doc._id, epfill.group('message_ready'));
      });
    });
  });

  Message.getReadMessagesByUserId(user_id, ep.done('has_read'));

  Message.getUnreadMessageByUserId(user_id, ep.done('unread', function (docs) {
    docs.forEach(function (doc) {
      doc.has_read = true;
      doc.save();
    });
    return docs;
  }));
};
