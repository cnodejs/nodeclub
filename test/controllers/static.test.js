var app = require('../../app');
var request = require('supertest')(app);

describe('test/controllers/static.test.js', function () {
  it('should get /about', function (done) {
    request.get('/about').expect(200)
      .end(function (err, res) {
        res.text.should.containEql('Ionichina  中文社区致力于 IonicFramework 在中国的推广、学习、研究工作。');
        done(err);
      });
  });

  it('should get /timeline', function (done) {
    request.get('/timeline').expect(200)
      .end(function (err, res) {
        res.text.should.containEql('时间线');
        done(err);
      });
  });

  it('should get /faq', function (done) {
    request.get('/faq').expect(200)
      .end(function (err, res) {
        res.text.should.containEql('这是为什么呢？');
        done(err);
      });
  });

  it('should get /getstart', function (done) {
    request.get('/getstart').expect(200)
    .end(function (err, res) {
      res.text.should.containEql('IonicFramework 新手入门');
      done(err);
    });
  });

  it('should get /robots.txt', function (done) {
    request.get('/robots.txt').expect(200)
      .end(function (err, res) {
        res.text.should.containEql('User-Agent');
        done(err);
      });
  });
});
