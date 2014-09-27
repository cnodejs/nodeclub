var should = require('should');
var app = require('../../app');
var request = require('supertest')(app);
var mm = require('mm');
var support = require('../support/support');
var _ = require('lodash');
var pedding = require('pedding');
var multiline = require('multiline');
var MessageService = require('../../common/message');


describe('test/common/message.test.js', function () {
  var atUser;
  var author;
  var topic;
  var reply;
  before(function (done) {
    support.ready(function () {
      atUser = support.normalUser;
      author = support.normalUser2;
      topic = support.testTopic;
      reply = {};
      done();
    });
  });

  describe('#sendReplyMessage', function () {
    it('should send reply message', function (done) {
      MessageService.sendReplyMessage(atUser._id, author._id, topic._id, reply._id,
        function (err, msg) {
          request.get('/my/messages')
          .set('Cookie', support.normalUserCookie)
          .expect(200, function (err, res) {
            var texts = [
              author.loginname,
              '回复了你的话题',
              topic.title,
            ];
            texts.forEach(function (text) {
              res.text.should.containEql(text)
            })
            done(err);
          });
        });
    });
  });

  describe('#sendAtMessage', function () {
    it('should send at message', function (done) {
      MessageService.sendAtMessage(atUser._id, author._id, topic._id, reply._id,
        function (err, msg) {
          request.get('/my/messages')
          .set('Cookie', support.normalUserCookie)
          .expect(200, function (err, res) {
            var texts = [
              author.loginname,
              '在话题',
              topic.title,
              '中@了你',
            ];
            texts.forEach(function (text) {
              res.text.should.containEql(text)
            })
            done(err);
          });
        });
    });
  });
})
