var app = require('../app');

describe('app.js', function () {

  before(function (done) {
    app.listen(0, done);
  });
  after(function () {
    app.close();
  });

  it('should / status 200', function (done) {
    app.request().get('/').end(function (res) {
      res.should.status(200);
      done();
    });
  });

});
