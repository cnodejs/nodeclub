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
      })
    })
  })

  describe('post /topic_collect/collect', function () {
    it('should collect topic', function (done) {
      request.post('/api/v1/topic_collect/collect')
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
      request.post('/api/v1/topic_collect/collect')
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

  describe('get /topic_collect/:loginname', function () {
    it('should list topic', function (done) {
      request.get('/api/v1/topic_collect/' + mockUser.loginname)
        .end(function (err, res) {
          should.not.exists(err);
          var collectTopicId = res.body.data[0].id;

          collectTopicId.should.equal(mockTopic.id)
          done()
        })
    })
  })

  describe('get /api/v1/topic/:topicid', function () {
    it('should return topic info', function (done) {
      request.get('/api/v1/topic/' + mockTopic.id)
        .query({
          accesstoken: mockUser.accessToken,
        })
        .end(function (err, res) {
          should.not.exists(err);
          res.body.data.is_collect.should.true();
          done();
        })
    })
  })

  describe('post /topic_collect/de_collect', function () {
    it('should de_collect topic', function (done) {
      request.post('/api/v1/topic_collect/de_collect')
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
      request.post('/api/v1/topic_collect/de_collect')
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
