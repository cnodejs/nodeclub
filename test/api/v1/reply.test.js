var app = require('../../../app');
var request = require('supertest')(app);
var pedding = require('pedding');
var support =  require('../../support/support');
var should  = require('should');

describe('test/api/v1/reply.test.js', function () {
  var mockTopic;
  var mockReplyId;
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
          accesstoken: support.normalUser.accessToken,
        })
        .end(function (err, res) {
          should.not.exists(err);
          res.body.success.should.true;
          mockReplyId = res.body.reply_id;
          done();
        });
    });

    it('should success with repli_id', function (done) {
      request.post('/api/v1/topic/' + mockTopic.id + '/replies')
        .send({
          content: 'reply a topic from api',
          accesstoken: support.normalUser.accessToken,
          repli_id: mockReplyId,
        })
        .end(function (err, res) {
          should.not.exists(err);
          res.body.success.should.true;
          done();
        });
    });

    it('should fail when topic is not found', function (done) {
      request.post('/api/v1/topic/' + mockTopic.id + 'not_found' + '/replies')
        .send({
          content: 'reply a topic from api',
          accesstoken: support.normalUser.accessToken,
        })
        .end(function (err, res) {
          should.not.exists(err);
          res.status.should.equal(500);
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
            accesstoken: support.normalUser.accessToken,
          })
          .expect(403)
          .end(function (err, res) {
            should.not.exists(err);

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
          accesstoken: support.normalUser.accessToken,
        })
        .end(function (err, res) {
          should.not.exists(err);
          res.body.should.eql({"success": true, "action": "up"});
          done();
        })
    });

    it('should down', function (done) {
      request.post('/api/v1/reply/' + mockReplyId + '/ups')
        .send({
          accesstoken: support.normalUser.accessToken,
        })
        .end(function (err, res) {
          should.not.exists(err);
          res.body.should.eql({"success": true, "action": "down"});
          done();
        })
    });

    it('do nothing when replyid is not found', function (done) {
      request.post('/api/v1/reply/' + mockReplyId + 'not_found' + '/ups')
        .send({
          accesstoken: support.normalUser.accessToken,
        })
        .end(function (err, res) {
          should.not.exists(err);
          res.status.should.equal(500);
          done();
        })
    });
  })

});
