var app = require('../../app');
var request = require('supertest')(app);

describe('test/controllers/sign.test.js', function () {
  it('should visit sign in page', function (done) {
    request.get('/signin').end(function (err, res) {
      res.text.should.containEql('登录');
      res.text.should.containEql('通过 GitHub 登录');
      done(err);
    });
  });
});
