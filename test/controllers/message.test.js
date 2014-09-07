var request = require('supertest');
var app = require('../../app');

describe('test/controllers/message.test.js', function () {

  describe('index', function () {
    it('should 302 without session', function (done) {
      request(app).get('/my/messages').end(function (err, res) {
        res.statusCode.should.equal(302);
        res.type.should.equal('text/plain');
        res.header.should.have.property('location');
        done(err);
      });
    });
  });
});
