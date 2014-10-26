var eventproxy = require('eventproxy');
var Message = require('../../proxy').Message;
var _ = require('lodash');

var index = function (req, res, next) {
  var user_id = req.user._id;
  var ep = new eventproxy();
  ep.fail(next);

  ep.all('has_read_messages', 'hasnot_read_messages', function (has_read_messages, hasnot_read_messages) {
    res.send({
      data: {
        has_read_messages: has_read_messages,
        hasnot_read_messages: hasnot_read_messages
      }
    });
  });

  ep.all('has_read', 'unread', function (has_read, unread) {
    [has_read, unread].forEach(function (msgs, idx) {
      var epfill = new eventproxy();
      epfill.fail(next);
      epfill.after('message_ready', msgs.length, function (docs) {
        docs = docs.filter(function (doc) {
          return !doc.is_invalid;
        });
        docs = docs.map(function (doc) {
          doc.author = _.pick(doc.author, ['loginname', 'avatar_url']);
          doc.topic = _.pick(doc.topic, ['id', 'author', 'title', 'last_reply_at']);
          doc.reply = _.pick(doc.reply, ['id', 'content', 'ups', 'create_at']);
          doc = _.pick(doc, ['id', 'type', 'has_read', 'author', 'topic', 'reply']);
          return doc;
        });
        ep.emit(idx === 0 ? 'has_read_messages' : 'hasnot_read_messages', docs);
      });
      msgs.forEach(function (doc) {
        Message.getMessageById(doc._id, epfill.group('message_ready'));
      });
    });
  });

  Message.getReadMessagesByUserId(user_id, ep.done('has_read'));

  Message.getUnreadMessageByUserId(user_id, ep.done('unread'));
};

exports.index = index;

var markAll = function (req, res, next) {
  var user_id = req.user._id;
  var ep = new eventproxy();
  ep.fail(next);
  Message.getUnreadMessageByUserId(user_id, ep.done('unread', function (docs) {
    docs.forEach(function (doc) {
      doc.has_read = true;
      doc.save();
    });
    return docs;
  }));

  ep.all('unread', function (unread) {
    unread = unread.map(function (doc) {
      doc = _.pick(doc, ['id']);
      return doc;
    });
    res.send({
      success: true,
      marked_msgs: unread,
    });
  });
};

exports.markAll = markAll;

var count = function (req, res, next) {
  var userId = req.user.id;

  var ep = new eventproxy();
  ep.fail(next);

  Message.getMessagesCount(userId, ep.done(function (count) {
    res.send({data: count});
  }));
};

exports.count = count;
