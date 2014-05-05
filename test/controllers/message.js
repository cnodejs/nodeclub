var request = require('supertest');
var should = require('should');
var app = require('../../app');

describe('controllers/message.js', function() {
  var server;

  before(function(done) {
    server = app.listen(0, done);
  });

  after(function() {
    server.close();
  });

  describe('index', function() {
    it('should 302 without session', function(done) {
      request(app).get('/my/messages').end(function(err, res) {
        res.statusCode.should.equal(302);
        res.type.should.equal('text/plain');
        res.header.should.have.property('location');
        done(err);
      });
    });
  });
});
