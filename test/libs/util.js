/*!
 * nodeclub - onehost plugins unit tests.
 * Copyright(c) 2012 dead-horse <dead_horse@qq.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */
var Util = require('../../libs/util');
var should = require('should');

describe('libs/util', function() {
  describe('escape', function() {
    var text1 = '<script></script> text';
    var text2 = 'outside:<>, inside: ```js\n<>\n```\n`<>`\n```\n<>\n```\n`uc` `uc`';
    it('escape outside ok', function() {
      var result = Util.escape(text1);
      result.should.equal('&lt;script&gt;&lt;/script&gt; text');
    });
    it('not escape inside', function() {
      var result = Util.escape(text2);
      result.should.equal('outside:&lt;&gt;, inside: ```js\n<>\n```\n`<>`\n```\n<>\n```\n`uc` `uc`');
    });
  });
});