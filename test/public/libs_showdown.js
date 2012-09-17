/*!
 * nodeclub - onehost plugins unit tests.
 * Copyright(c) 2012 dead-horse <dead_horse@qq.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var showdown = require('../../public/libs/showdown');
var should = require('should');

describe('showdown xss test', function () {
  it('should escape illegal url in a', function () {
    var text = '[illegal url][1]\n\n[1]: javascript:alert(123);';
    var result = showdown.parse(text);
    result.should.equal('<p><a href="http://localhost.cnodejs.org:3000javascript:alert(123);">illegal url</a></p>');
  });

  it('should escape " in a', function () {
    var text = '[illegal url][1]\n\n[1]: http://baidu.com"onmouseover=\'alert(123)\'';
    var result = showdown.parse(text);
    result.should.equal('<p><a href="http://baidu.com&quot;onmouseover=\'alert(123)\'">illegal url</a></p>');
  });

  it('should escape illegal url in img', function () {
    var text = '![illegal url][1]\n\n[1]: javascript:alert(123);';
    var result = showdown.parse(text);
    result.should.equal('<p><img src="http://localhost.cnodejs.org:3000javascript:alert(123);" alt="illegal url" title="" /></p>');
  });

  it('should escape " in img', function () {
    var text = '![illegal url][1]\n\n[1]: http://baidu.com"onmouseover=\'alert(123)\'';
    var result = showdown.parse(text);
    result.should.equal('<p><img src="http://baidu.com&quot;onmouseover=\'alert(123)\'" alt="illegal url" title="" /></p>');
  });
});