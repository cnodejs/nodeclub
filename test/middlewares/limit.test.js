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
      limitMiddleware.peripperday(visitor, 3), function (req, res) {
        res.send('hello');
      });

    supertest = require('supertest')(app);
  });
  describe('#peripperday', function () {
    it('should visit', function (done) {
      supertest.get('/test_peripperday').end(function () {
        supertest.get('/test_peripperday').end(function () {
          supertest.get('/test_peripperday').end(function (err, res) {
            res.text.should.eql('hello');
            done();
          });
        });
      });
    });
    it('should not visit', function (done) {
      supertest.get('/test_peripperday')
        .end(function (err, res) {
          res.text.should.eql('ratelimit forbidden. limit is 3 per day.');
          done(err);
        });
    });
  });
});
