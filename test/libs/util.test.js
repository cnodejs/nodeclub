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

describe('libs/util', function () {
  describe('escape', function () {
    var text1 = '<script></script> text';
    var text2 = 'outside:<>, inside: ```js\n<>\n```\n`<>`\n```\n<>\n```\n`span` `span`';
    var text3 = '\t<>\n    <>\n';
    var text4 = 'abc\n\t<>\n\t<>';
    var text5 = '\t<>\n\t<>\n<>';
    it('escape outside ok', function () {
      var result = Util.escape(text1);
      result.should.equal('&lt;script&gt;&lt;/script&gt; text');
    });
    it('not escape inside', function () {
      var result = Util.escape(text2);
      result.should.equal('outside:&lt;&gt;, inside: ```js\n<>\n```\n`<>`\n```\n<>\n```\n`span` `span`');
    });
    it('not escape inside block', function () {
      var result = Util.escape(text3);
      result.should.equal('\t<>\n    <>\n');
    });
    it('escape not inside', function () {
      var result = Util.escape(text4);
      result.should.equal('abc\n\t&lt;&gt;\n\t&lt;&gt;');
    });
    it('escape block next char ok', function () {
      var result = Util.escape(text5);
      result.should.equal('\t<>\n\t<>\n&lt;&gt;');
    });
  });
});
