

var app = require('../../../app');
var request = require('supertest')(app);
var should = require('should');
var support = require('../../support/support');


describe('test/api/v1/topic.test.js', function () {
  var mockUser, mockTopic;
  before(function (done) {
    support.createUser(function (err, user) {
      mockUser = user;
      support.createTopic(user.id, function (err, topic) {
        mockTopic = topic;
        done();
      })
    })
  })

  describe('get /api/v1/topics', function () {
    it('should return topics', function (done) {
      request.get('/api/v1/topics')
        .end(function (err, res) {
          should.not.exists(err);
          res.body.data.length.should.above(0);
          done();
        });
    });

    it('should return topics', function (done) {
      request.get('/api/v1/topics')
        .query({
          limit: 2
        })
        .end(function (err, res) {
          should.not.exists(err);
          res.body.data.length.should.equal(2);
          done();
        });
    });
  });

  describe('get /api/v1/topic/:topicid', function () {
    it('should return topic info', function (done) {

      request.get('/api/v1/topic/' + mockTopic.id)
        .end(function (err, res) {
          should.not.exists(err);
          res.body.data.id.should.equal(mockTopic.id);
          done();
        })
    })
  })

  describe('post /api/v1/topics', function () {
    it('should create a topic', function (done) {
      request.post('/api/v1/topics')
        .send({
          accesstoken: mockUser.accessToken,
          title: '我是 api 测试小助手',
          tab: 'share',
          content: '我也是 api 测试小助手',
        })
        .end(function (err, res) {
          should.not.exists(err);
          res.body.success.should.true;
          res.body.topic_id.should.be.String;
          done();
        })
    })
  })

  describe('post /api/v1/topic/collect', function () {
    it('should collect topic', function (done) {
      request.post('/api/v1/topic/collect')
        .send({
          accesstoken: mockUser.accessToken,
          topic_id: mockTopic.id
        })
        .end(function (err, res) {
          should.not.exists(err);
          res.body.should.eql({"success": true});
          done();
        })
    });

    it('do nothing when topic is not found', function (done) {
      request.post('/api/v1/topic/collect')
        .send({
          accesstoken: support.normalUser.accessToken,
          topic_id: mockTopic.id + 'not_found'
        })
        .end(function (err, res) {
          should.not.exists(err);
          res.status.should.equal(500);
          done();
        })
    });
  })

  describe('post /api/v1/topic/de_collect', function () {
    it('should de_collect topic', function (done) {
      request.post('/api/v1/topic/de_collect')
        .send({
          accesstoken: mockUser.accessToken,
          topic_id: mockTopic.id
        })
        .end(function (err, res) {
          should.not.exists(err);
          res.body.should.eql({"success": true});
          done();
        })
    });

    it('do nothing when topic is not found', function (done) {
      request.post('/api/v1/topic/de_collect')
        .send({
          accesstoken: support.normalUser.accessToken,
          topic_id: mockTopic.id + 'not_found'
        })
        .end(function (err, res) {
          should.not.exists(err);
          res.status.should.equal(500);
          done();
        })
    });
  })
})
