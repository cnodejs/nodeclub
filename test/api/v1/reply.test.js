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

  it('should reply a topic', function (done) {
    request.post('/api/v1/topic/' + mockTopic.id + '/replies')
      .send({
        content: 'reply a topic from api',
        accesstoken: support.normalUser.accessToken,
      })
      .end(function (err, res) {
        should.not.exists(err);
        res.body.success.should.true;
        mockReplyId = res.body.repli_id;
        done();
      });
  });

  it('should reply a topic with repli_id', function (done) {
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
});
