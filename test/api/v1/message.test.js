var support = require('../../support/support');
var message = require('../../../common/message');
var MessageProxy = require('../../../proxy').Message;
var app = require('../../../app');
var request = require('supertest')(app);
var mm = require('mm');
var should = require('should');

describe('test/api/v1/message.test.js', function () {

  var mockUser;

  before(function (done) {
    support.ready(function () {
      support.createUser(function (err, user) {
        mockUser = user;
        done();
      });
    });
  });

  afterEach(function () {
    mm.restore();
  });

  it('should get unread messages', function (done) {
    mm(MessageProxy, 'getMessageById', function (id, callback) {
      callback(null, {reply: {author: {}}});
    });
    message.sendReplyMessage(mockUser.id, mockUser.id, mockUser.id, mockUser.id,
      function (err) {
        should.not.exists(err);
        request.get('/api/v1/messages')
          .query({
            accesstoken: mockUser.accessToken
          })
          .end(function (err, res) {
            res.body.data.hasnot_read_messages.length.should.above(0);
            done();
          });
      });
  });

  it('should get unread messages count', function (done) {
    mm(MessageProxy, 'getMessageById', function (id, callback) {
      callback(null, {reply: {author: {}}});
    });
    request.get('/api/v1/message/count')
      .query({
        accesstoken: mockUser.accessToken
      })
      .end(function (err, res) {
        res.body.data.should.equal(1);
        done();
      });
  });

  it('should mark all messages read', function (done) {
    request.post('/api/v1/message/mark_all')
      .send({
        accesstoken: mockUser.accessToken
      })
      .end(function (err, res) {
        // 第一次查询有一个
        res.body.marked_msgs.length.should.equal(1);
        request.post('/api/v1/message/mark_all')
          .send({
            accesstoken: mockUser.accessToken
          })
          .end(function (err, res) {
            // 第二次查询没了
            res.body.marked_msgs.length.should.equal(0);
            done();
          });
      });
  });
  
});
