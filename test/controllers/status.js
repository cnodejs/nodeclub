var app = require('../../app');

describe('controllers/status.js', function () {
  before(function (done) {
    app.listen(0, done);
  });
  after(function () {
    app.close();
  });

  it('should /status 200', function (done) {
    app.request().get('/status').end(function (res) {
      res.should.status(200);
      res.should.header('content-type', 'application/json; charset=utf-8');
      var json;
      try {
        json = JSON.parse(res.body.toString());
      } catch (e) {
        done(e);
      }
      json.should.have.property("status", "success");
      json.should.have.property("now");
      done();
    });
  });
});
