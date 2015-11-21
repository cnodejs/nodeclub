var should = require('should');
var app = require('../../app');
var request = require('supertest')(app);
var mm = require('mm');
var support = require('../support/support');
var _ = require('lodash');
var pedding = require('pedding');
var multiline = require('multiline');
var renderHelper = require('../../common/render_helper');

describe('test/common/render_helper.test.js', function () {
  describe('#markdown', function () {
    it('should render code inline', function () {
      var text = multiline(function () {;
    /*
`var a = 1;`
    */
      });

      var rendered = renderHelper.markdown(text);
      rendered.should.equal('<div class="markdown-text"><p><code>var a = 1;</code></p>\n</div>');
    });

    it('should render fence', function () {
      var text = multiline(function () {;
    /*
```js
var a = 1;
```
    */
      });

      var rendered = renderHelper.markdown(text);
      rendered.should.equal('<div class=\"markdown-text\"><pre class=\"prettyprint language-js\"><code>var a = 1;\n</code></pre></div>');
    });

    it('should render code block', function () {
      var text = multiline(function () {;
/*
    var a = 1;
*/
      });

      var rendered = renderHelper.markdown(text);
      rendered.should.equal('<div class="markdown-text"><pre class="prettyprint"><code>var a = 1;</code></pre></div>');
    });
  });

  describe('#escapeSignature', function () {
    it('should escape content', function () {
      var signature = multiline(function () {;
/*
我爱北京天安门<script>alert(1)
</script>
*/
      });
      var escaped = renderHelper.escapeSignature(signature);
      escaped.should.equal('我爱北京天安门&lt;script&gt;alert(1)<br>&lt;/script&gt;');
    })
  })

  describe('#tabName', function () {
    it('should translate', function () {
      renderHelper.tabName('share')
        .should.equal('分享')
    })
  })


});
