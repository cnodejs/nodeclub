var should = require('should');
var app = require('../../app');

describe('controllers/topic.js', function () {
  before(function (done) {
    app.listen(0, done);
  });

  after(function () {
    app.close();
  });

  describe('index', function () {
    it('should ok', function (done) {
      app.request().get('/topic/inexist').end(function (res) {
        res.should.status(200);
        var body = res.body.toString();
        body.should.include('此话题不存在或已被删除。');
        done();
      });
    });
  });
});
