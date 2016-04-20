var app = require('../../../app');
var request = require('supertest')(app);
var should = require('should');
var support = require('../../support/support');

describe('test/api/v1/topic_collect.test.js', function () {

  var mockUser, mockTopic;

  before(function (done) {
    support.createUser(function (err, user) {
      mockUser = user;
      support.createTopic(user.id, function (err, topic) {
        mockTopic = topic;
        done();
      });
    });
  });

  // 主题被收藏之前
  describe('before collect topic', function () {

    describe('get /topic_collect/:loginname', function () {

      it('should list topic with length = 0', function (done) {
        request.get('/api/v1/topic_collect/' + mockUser.loginname)
          .end(function (err, res) {
            should.not.exists(err);
            res.body.success.should.true();
            res.body.data.length.should.equal(0);
            done();
          });
      });

    });

    describe('get /api/v1/topic/:topicid', function () {

      it('should return topic info with is_collect = false', function (done) {
        request.get('/api/v1/topic/' + mockTopic.id)
          .query({
            accesstoken: mockUser.accessToken
          })
          .end(function (err, res) {
            should.not.exists(err);
            res.body.success.should.true();
            res.body.data.is_collect.should.false();
            done();
          });
      });

    });

  });

  // 收藏主题
  describe('post /topic_collect/collect', function () {

    it('should 401 with no accessToken', function (done) {
      request.post('/api/v1/topic_collect/collect')
        .send({
          topic_id: mockTopic.id
        })
        .end(function (err, res) {
          should.not.exists(err);
          res.status.should.equal(401);
          res.body.success.should.false();
          done();
        });
    });

    it('should collect topic with correct accessToken', function (done) {
      request.post('/api/v1/topic_collect/collect')
        .send({
          accesstoken: mockUser.accessToken,
          topic_id: mockTopic.id
        })
        .end(function (err, res) {
          should.not.exists(err);
          res.body.success.should.true();
          done();
        });
    });

    it('should not collect topic twice', function (done) {
      request.post('/api/v1/topic_collect/collect')
        .send({
          accesstoken: mockUser.accessToken,
          topic_id: mockTopic.id
        })
        .end(function (err, res) {
          should.not.exists(err);
          res.body.success.should.false();
          done();
        });
    });

    it('should fail when topic_id is not valid', function (done) {
      request.post('/api/v1/topic_collect/collect')
        .send({
          accesstoken: mockUser.accessToken,
          topic_id: mockTopic.id + "not_valid"
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
      request.post('/api/v1/topic_collect/collect')
        .send({
          accesstoken: mockUser.accessToken,
          topic_id: notFoundTopicId
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

  });

  // 主题被收藏之后
  describe('after collect topic', function () {

    describe('get /topic_collect/:loginname', function () {

      it('should list topic with length = 1', function (done) {
        request.get('/api/v1/topic_collect/' + mockUser.loginname)
          .end(function (err, res) {
            should.not.exists(err);
            res.body.success.should.true();
            res.body.data.length.should.equal(1);
            res.body.data[0].id.should.equal(mockTopic.id);
            done();
          });
      });

      it('should fail when user not found', function (done) {
        request.get('/api/v1/topic_collect/' + mockUser.loginname + 'not_found')
          .end(function (err, res) {
            should.not.exists(err);
            res.status.should.equal(404);
            res.body.success.should.false();
            done();
          });
      });

    });

    describe('get /api/v1/topic/:topicid', function () {

      it('should return topic info with is_collect = true', function (done) {
        request.get('/api/v1/topic/' + mockTopic.id)
          .query({
            accesstoken: mockUser.accessToken
          })
          .end(function (err, res) {
            should.not.exists(err);
            res.body.success.should.true();
            res.body.data.is_collect.should.true();
            done();
          });
      });

    });

  });

  // 取消收藏主题
  describe('post /topic_collect/de_collect', function () {

    it('should 401 with no accessToken', function (done) {
      request.post('/api/v1/topic_collect/de_collect')
        .send({
          topic_id: mockTopic.id
        })
        .end(function (err, res) {
          should.not.exists(err);
          res.status.should.equal(401);
          res.body.success.should.false();
          done();
        });
    });

    it('should decollect topic with correct accessToken', function (done) {
      request.post('/api/v1/topic_collect/de_collect')
        .send({
          accesstoken: mockUser.accessToken,
          topic_id: mockTopic.id
        })
        .end(function (err, res) {
          should.not.exists(err);
          res.body.success.should.true();
          done();
        });
    });

    it('should not decollect topic twice', function (done) {
      request.post('/api/v1/topic_collect/de_collect')
        .send({
          accesstoken: mockUser.accessToken,
          topic_id: mockTopic.id
        })
        .end(function (err, res) {
          should.not.exists(err);
          res.body.success.should.false();
          done();
        });
    });

    it('should fail when topic_id is not valid', function (done) {
      request.post('/api/v1/topic_collect/de_collect')
        .send({
          accesstoken: mockUser.accessToken,
          topic_id: mockTopic.id + "not_valid"
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
      request.post('/api/v1/topic_collect/de_collect')
        .send({
          accesstoken: mockUser.accessToken,
          topic_id: notFoundTopicId
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

  });

  // 主题被取消收藏之后
  describe('after decollect topic', function () {

    describe('get /topic_collect/:loginname', function () {

      it('should list topic with length = 0', function (done) {
        request.get('/api/v1/topic_collect/' + mockUser.loginname)
          .end(function (err, res) {
            should.not.exists(err);
            res.body.success.should.true();
            res.body.data.length.should.equal(0);
            done();
          });
      });

    });

    describe('get /api/v1/topic/:topicid', function () {

      it('should return topic info with is_collect = false', function (done) {
        request.get('/api/v1/topic/' + mockTopic.id)
          .query({
            accesstoken: mockUser.accessToken
          })
          .end(function (err, res) {
            should.not.exists(err);
            res.body.success.should.true();
            res.body.data.is_collect.should.false();
            done();
          });
      });

    });

  });

});
