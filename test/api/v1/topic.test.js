

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

  describe('/api/v1/topics', function () {
    it('should return topics', function (done) {
      request.get('/api/v1/topics')
        .end(function (err, res) {
          should.not.exists(err);
          res.body.data.length.should.above(0);
          done();
        })
    });

    it('should return topics', function (done) {
      request.get('/api/v1/topics')
        .query({
          limit: 10
        })
        .end(function (err, res) {
          should.not.exists(err);
          res.body.data.length.should.equal(10);
          done();
        })
    })
  })

  describe('/api/v1/topic/:topicid', function () {
    it('should return topic info', function (done) {

      request.get('/api/v1/topic/' + mockTopic.id)
        .end(function (err, res) {
          should.not.exists(err);
          res.body.data.id.should.equal(mockTopic.id);
          done();
        })
    })
  })
})
