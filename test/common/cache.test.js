var cache = require('../../common/cache');
var should = require('should');

describe('test/common/cache.test.js', function () {
  it('should set && get', function (done) {
    cache.set('alsotang', {age: 23}, function () {
      cache.get('alsotang', function (err, data) {
        data.should.eql({age: 23});
        done();
      });
    });
  });

  it('should expire', function (done) {
    cache.set('alsotang', {age: 23}, 1, function () {
      setTimeout(function () {
        cache.get('alsotang', function (err, data) {
          should.not.exist(data);
          done();
        });
      }, 1.5 * 1000);
    });
  });
});
