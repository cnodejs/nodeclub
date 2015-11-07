var config  = require('../config');
var utility = require('utility');
var path    = require('path');
var fs      = require('fs');

exports.upload = function (file, options, callback) {
  var filename = options.filename;

  var newFilename = utility.md5(filename + String((new Date()).getTime())) +
    path.extname(filename);

  var upload_path = config.upload.path;
  var base_url    = config.upload.url;
  var filePath    = path.join(upload_path, newFilename);
  var fileUrl     = base_url + newFilename;

  file.on('end', function () {
    callback(null, {
      url: fileUrl
    });
  });

  file.pipe(fs.createWriteStream(filePath));
};
