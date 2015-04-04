var proxyMiddleware = require('../../middlewares/proxy');

describe('test/middlewares/proxy.test.js', function () {
  it('should forbidden google.com', function (done) {
    var url = 'https://www.google.com.hk/#newwindow=1&q=%E5%85%AD%E5%9B%9B%E4%BA%8B%E4%BB%B6';
    proxyMiddleware.proxy(
      {query: {url: url}},
      {send: function (msg) {
        msg.should.eql('www.google.com.hk is not allowed');
        done();
      }});
  });

  it('should allow githubusercontent.com', function (done) {
    var url = 'https://avatars.githubusercontent.com/u/1147375?v=3&s=120';
    proxyMiddleware.proxy(
      {query: {url: url}},
      {send: function (msg) {
        throw new Error('should not enter here');
      }});
    setTimeout(function () {
      done();
    }, 100);
  });

  it('should allow gravatar.com', function (done) {
    var url = 'https://gravatar.com/avatar/28d69c69c1c1a040436124238f7cc937?size=48';
    proxyMiddleware.proxy(
      {query: {url: url}},
      {send: function (msg) {
        throw new Error('should not enter here');
      }});
    setTimeout(function () {
      done();
    }, 100);
  });

});
