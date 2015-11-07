var User       = require('../proxy/user');
var Message    = require('../proxy/message');
var JPush      = require("jpush-sdk");
var eventproxy = require('eventproxy');
var config     = require('../config');
var client     = null;

if (config.jpush && config.jpush.masterSecret !== 'YourSecretKeyyyyyyyyyyyyy') {
  client = JPush.buildClient(config.jpush);
}

/**
 * 通过极光推送发生消息通知
 * @param {String} type 消息类型
 * @param {String} author_id 消息作者ID
 * @param {String} master_id 被通知者ID
 * @param {String} topic_id 相关主题ID
 */
exports.send = function (type, author_id, master_id, topic_id) {
  if (client !== null) {
    var ep = new eventproxy();
    User.getUserById(author_id, ep.done('author'));
    Message.getMessagesCount(master_id, ep.done('count'));
    ep.all('author', 'count', function (author, count) {
      var msg = author.loginname + ' ';
      var extras = {
        topicId: topic_id
      };
      switch (type) {
      case 'at':
        msg += '@了你';
        break;
      case 'reply':
        msg += '回复了你的主题';
        break;
      default:
        break;
      }
      client.push()
        .setPlatform(JPush.ALL)
        .setAudience(JPush.alias(master_id.toString()))
        .setNotification(msg,
          JPush.ios(msg, null, count, null, extras),
          JPush.android(msg, null, null, extras)
        )
        .setOptions(null, null, null, !config.debug)
        .send(function (err, res) {
          if (config.debug) {
            if (err) {
              console.log(err.message);
            } else {
              console.log('Sendno: ' + res.sendno);
              console.log('Msg_id: ' + res.msg_id);
            }
          }
        });
    })
  }
};
