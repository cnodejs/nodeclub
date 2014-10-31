var should = require('should');
var app = require('../../app');
var request = require('supertest')(app);
var mm = require('mm');
var support = require('../support/support');
var _ = require('lodash');
var pedding = require('pedding');
var multiline = require('multiline');
var renderHelpers = require('../../common/render_helpers');

describe('test/common/render_helpers.test.js', function () {
  describe('#markdown', function () {
    it('should render code', function () {
      var text = multiline(function () {;
    /*
```js
var a = 1;
```
    */
      });

      var rendered = renderHelpers.markdown(text);
      rendered.should.equal('<div class=\"markdown-text\"><pre class=\"prettyprint language-js\"><code>var a = 1;\n</code></pre></div>');
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
      var escaped = renderHelpers.escapeSignature(signature);
      escaped.should.equal('我爱北京天安门&lt;script&gt;alert(1)<br>&lt;/script&gt;');
    })
  })

  describe('#tabName', function () {
    it('should translate', function () {
      renderHelpers.tabName('share')
        .should.equal('分享')
    })
  })


});
