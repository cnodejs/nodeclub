var limitMiddleware = require('../../middlewares/limit');
var app = require('../../app');
var supertest;
var support = require('../support/support');
var pedding = require('pedding');
var visitor = 'visit' + Date.now();

describe('test/middlewares/limit.test.js', function () {
  before(function (done) {
    support.ready(done);
  });

  before(function () {
    app.get('/test_peripperday',
      limitMiddleware.peripperday(visitor, 3, {showJson: true}), function (req, res) {
        res.send('hello');
      });

    supertest = require('supertest')(app);
  });
  describe('#peripperday', function () {
    it('should visit', function (done) {
      supertest.get('/test_peripperday').set('x-real-ip', '127.0.0.1').end(function () {
        supertest.get('/test_peripperday').set('x-real-ip', '127.0.0.1').end(function () {
          supertest.get('/test_peripperday').set('x-real-ip', '127.0.0.1').end(function (err, res) {
            res.text.should.eql('hello');
            done();
          });
        });
      });
    });
    it('should not visit', function (done) {
      supertest.get('/test_peripperday')
        .set('x-real-ip', '127.0.0.1')
        .end(function (err, res) {
          res.status.should.equal(403);
          res.body.success.should.false();
          done(err);
        });
    });
  });
});
