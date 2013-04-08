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
        res.should.status(302);
        res.should.header('content-type', 'text/html');
        res.should.header('location');
        done();
      });
    });
  });
});
