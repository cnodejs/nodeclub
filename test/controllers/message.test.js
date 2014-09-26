var request = require('supertest');
var app = require('../../app');
var support = require('../support/support');

describe('test/controllers/message.test.js', function () {
  before(function (done) {
    support.ready(done);
  });

  describe('index', function () {
    it('should 302 without session', function (done) {
      request(app).get('/my/messages').end(function (err, res) {
        res.statusCode.should.equal(302);
        res.type.should.equal('text/plain');
        res.header.should.have.property('location');
        done(err);
      });
    });

    it('should 200', function (done) {
      request(app).get('/my/messages')
      .set('Cookie', support.normalUserCookie)
      .expect(200)
      .end(function (err, res) {
        res.text.should.containEql('新消息');
        done(err);
      });
    });
  });
});
