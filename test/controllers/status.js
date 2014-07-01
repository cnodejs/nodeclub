var request = require('supertest');
var app = require('../../app');

describe('controllers/status.js', function () {

  it('should /status 200', function (done) {
    request(app).get('/status').end(function (err, res) {
      res.status.should.equal(200);
      res.should.be.a.json;
      res.body.should.have.property("status", "success");
      res.body.should.have.property("now");
      done(err);
    });
  });
});
