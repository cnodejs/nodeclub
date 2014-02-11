var should = require('should');
var app = require('../../app');

describe('controllers/message.js', function () {
  before(function (done) {
    app.listen(0, done);
  });

  after(function () {
    app.close();
  });

  describe('index', function () {
    it('should 302 without session', function (done) {
      app.request().get('/my/messages').end(function (res) {
        res.statusCode.should.equal(302);
        res.headers.should.have.property('content-type', 'text/html');
        res.headers.should.have.property('location');
        done();
      });
    });
  });
});
