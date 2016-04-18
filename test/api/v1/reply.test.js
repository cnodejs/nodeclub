var app = require('../../../app');
var request = require('supertest')(app);
var pedding = require('pedding');
var support =  require('../../support/support');
var should  = require('should');

describe('test/api/v1/reply.test.js', function () {
  
  var mockTopic, mockReplyId;
  
  before(function (done) {
    support.ready(function () {
      support.createTopic(support.normalUser.id, function (err, topic) {
        mockTopic = topic;
        done();
      });
    });
  });

  describe('create reply', function () {

    it('should success', function (done) {
      request.post('/api/v1/topic/' + mockTopic.id + '/replies')
        .send({
          content: 'reply a topic from api',
          accesstoken: support.normalUser.accessToken
        })
        .end(function (err, res) {
          should.not.exists(err);
          res.body.success.should.true();
          mockReplyId = res.body.reply_id;
          done();
        });
    });

    it('should success with repli_id', function (done) {
      request.post('/api/v1/topic/' + mockTopic.id + '/replies')
        .send({
          content: 'reply a topic from api',
          accesstoken: support.normalUser.accessToken,
          repli_id: mockReplyId
        })
        .end(function (err, res) {
          should.not.exists(err);
          res.body.success.should.true();
          done();
        });
    });

    it('should 401 when no accessToken', function (done) {
      request.post('/api/v1/topic/' + mockTopic.id + 'not_valid' + '/replies')
        .send({
          content: 'reply a topic from api'
        })
        .end(function (err, res) {
          should.not.exists(err);
          res.status.should.equal(401);
          res.body.success.should.false();
          done();
        });
    });

    it('should fail when topic_id is not valid', function (done) {
      request.post('/api/v1/topic/' + mockTopic.id + 'not_valid' + '/replies')
        .send({
          content: 'reply a topic from api',
          accesstoken: support.normalUser.accessToken
        })
        .end(function (err, res) {
          should.not.exists(err);
          res.status.should.equal(400);
          res.body.success.should.false();
          done();
        });
    });

    it('should fail when no content', function (done) {
      request.post('/api/v1/topic/' + mockTopic.id + '/replies')
        .send({
          content: '',
          accesstoken: support.normalUser.accessToken
        })
        .end(function (err, res) {
          should.not.exists(err);
          res.status.should.equal(400);
          res.body.success.should.false();
          done();
        });
    });

    it('should fail when topic not found', function (done) {
      var notFoundTopicId = mockTopic.id.split("").reverse().join("");
      request.post('/api/v1/topic/' + notFoundTopicId + '/replies')
        .send({
          content: 'reply a topic from api',
          accesstoken: support.normalUser.accessToken
        })
        .end(function (err, res) {
          should.not.exists(err);
          if (mockTopic.id === notFoundTopicId) { // 小概率事件id反转之后还不变
            res.body.success.should.true();
          } else {
            res.status.should.equal(404);
            res.body.success.should.false();
          }
          done();
        });
    });

    it('should fail when topic is locked', function (done) {
      // 锁住 topic
      mockTopic.lock = !mockTopic.lock;
      mockTopic.save(function () {
        request.post('/api/v1/topic/' + mockTopic.id + '/replies')
          .send({
            content: 'reply a topic from api',
            accesstoken: support.normalUser.accessToken
          })
          .end(function (err, res) {
            should.not.exists(err);
            res.status.should.equal(403);
            res.body.success.should.false();
            // 解锁 topic
            mockTopic.lock = !mockTopic.lock;
            mockTopic.save(function () {
              done();
            });
          });
      });
    });

  });
  
  describe('create ups', function () {

    it('should up', function (done) {
      request.post('/api/v1/reply/' + mockReplyId + '/ups')
        .send({
          accesstoken: support.normalUser.accessToken
        })
        .end(function (err, res) {
          should.not.exists(err);
          res.body.success.should.true();
          res.body.action.should.equal("up");
          done();
        });
    });

    it('should down', function (done) {
      request.post('/api/v1/reply/' + mockReplyId + '/ups')
        .send({
          accesstoken: support.normalUser.accessToken
        })
        .end(function (err, res) {
          should.not.exists(err);
          res.body.success.should.true();
          res.body.action.should.equal("down");
          done();
        });
    });

    it('should 401 when no accessToken', function (done) {
      request.post('/api/v1/reply/' + mockReplyId + '/ups')
        .end(function (err, res) {
          should.not.exists(err);
          res.status.should.equal(401);
          res.body.success.should.false();
          done();
        });
    });

    it('should fail when reply_id is not valid', function (done) {
      request.post('/api/v1/reply/' + mockReplyId + 'not_valid' + '/ups')
        .send({
          accesstoken: support.normalUser.accessToken
        })
        .end(function (err, res) {
          should.not.exists(err);
          res.status.should.equal(400);
          res.body.success.should.false();
          done();
        });
    });

    it('should fail when reply_id is not found', function (done) {
      var notFoundReplyId = mockReplyId.split("").reverse().join("");
      request.post('/api/v1/reply/' + notFoundReplyId + '/ups')
        .send({
          accesstoken: support.normalUser.accessToken
        })
        .end(function (err, res) {
          should.not.exists(err);
          if (mockReplyId === notFoundReplyId) { // 小概率事件id反转之后还不变
            res.body.success.should.true();
          } else {
            res.status.should.equal(404);
            res.body.success.should.false();
          }
          done();
        });
    });

  });
  
});
