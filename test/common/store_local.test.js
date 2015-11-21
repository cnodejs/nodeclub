var path = require('path');
var fs = require('fs');
var storeLocal = require('../../common/store_local');
var config = require('../../config');

describe('test/common/store_local.test.js', function () {
  it('should upload a file', function (done) {
    var file = fs.createReadStream(path.join(__dirname, 'at.test.js'));
    var filename = 'at.test.js';
    storeLocal.upload(file, {filename: filename}, function (err, data) {
      var newFilename = data.url.match(/([^\/]+\.js)$/)[1];
      var newFilePath = path.join(config.upload.path, newFilename);
      setTimeout(function () {
        fs.existsSync(newFilePath)
          .should.ok();
        fs.unlinkSync(newFilePath);
        done(err);
      }, 1 * 1000);
    });
  });
});
